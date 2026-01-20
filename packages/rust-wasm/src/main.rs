use actix_cors::Cors;
use actix_web::{App, HttpResponse, HttpServer, Responder, post, web};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Deserialize)]
struct UserRequest {
    prompt: String,
}

#[derive(Serialize)]
struct GeminiResponse {
    text: String,
}

#[post("/ask")]
async fn ask_ai(req: web::Json<UserRequest>) -> impl Responder {
    let api_key = std::env::var("GEMINI_API_KEY").expect("API Key not set");

    // Using the 2026 stable-track endpoint for Gemini 3 Flash
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={}",
        api_key
    );

    let client = Client::new();

    // FIXED: Correct nesting for Gemini 3 Thinking Config
    let body = json!({
        "contents": [{ "parts": [{ "text": &req.prompt }] }],
        "generationConfig": {
            "thinking_config": {
                "thinking_level": "minimal"
            }
        }
    });

    // 1. Sending the Request to Google
    let res = client.post(url).json(&body).send().await;

    match res {
        Ok(response) => {
            let json: serde_json::Value = response.json().await.unwrap();

            // DEBUG: Keep this to see what Google is sending during development
            println!("Full Google Response: {:#?}", json);

            // 2. ROBUST PARSING:
            // Gemini 3 can return multiple parts (one for thoughts, one for text).
            // This logic finds the specific part that contains the "text" key.
            let ai_text = json["candidates"][0]["content"]["parts"]
                .as_array()
                .and_then(|parts| {
                    parts
                        .iter()
                        .find(|p| p.get("text").is_some()) // Find the part with text
                        .and_then(|p| p["text"].as_str()) // Get the string value
                })
                .or_else(|| {
                    // Fallback: If no text is found, check if there's a "thought" part
                    json["candidates"][0]["content"]["parts"][0]["thought"].as_str()
                })
                .unwrap_or("The AI returned an empty response. Try a different prompt.");

            // 3. Sending the final Response back to the React app
            HttpResponse::Ok().json(GeminiResponse {
                text: ai_text.to_string(),
            })
        }
        Err(e) => {
            println!("Request Error: {:?}", e);
            HttpResponse::InternalServerError().body("Error reaching Gemini API")
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    println!("Server running on http://localhost:8080");

    HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173") // Your React Dev Server
            .allowed_methods(vec!["POST"])
            .allow_any_header()
            .max_age(3600);

        App::new().wrap(cors).service(ask_ai)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

