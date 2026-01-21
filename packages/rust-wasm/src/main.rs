use actix_cors::Cors;
use actix_web::{App, HttpResponse, HttpServer, Responder, post, web};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Deserialize)]
struct UserRequest {
    // We now accept the full conversation history from the frontend
    contents: Vec<serde_json::Value>,
}

#[derive(Serialize)]
struct GeminiResponse {
    text: String,
}

#[post("/ask")]
async fn ask_ai(req: web::Json<UserRequest>) -> impl Responder {
    let api_key = std::env::var("GEMINI_API_KEY").expect("API Key not set");

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={}",
        api_key
    );

    let client = Client::new();

    let body = json!({
        "contents": req.contents,
        "system_instruction": {
            "parts": [{
                "text": "You are a senior Rust and React developer. Give concise, technical answers. Use a slightly sarcastic, witty tone."
            }]
        },
        "generationConfig": {
            "thinking_config": {
                "thinking_level": "minimal"
            }
        }
    });

    let res = client.post(url).json(&body).send().await;

    match res {
        Ok(response) => {
            let json: serde_json::Value = response.json().await.unwrap();

            // Debug print to see the conversation history growing in your terminal
            println!("Full Google Response: {:#?}", json);

            // Robust parsing to find the "text" part among possible "thought" parts
            let ai_text = json["candidates"][0]["content"]["parts"]
                .as_array()
                .and_then(|parts| {
                    parts
                        .iter()
                        .find(|p| p.get("text").is_some())
                        .and_then(|p| p["text"].as_str())
                })
                .or_else(|| json["candidates"][0]["content"]["parts"][0]["thought"].as_str())
                .unwrap_or("The AI returned an empty response.");

            HttpResponse::Ok().json(GeminiResponse {
                text: ai_text.to_string(),
            })
        }
        Err(e) => {
            eprintln!("Request Error: {:?}", e);
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
            .allowed_origin("http://localhost:5173")
            .allowed_methods(vec!["POST"])
            .allow_any_header()
            .max_age(3600);

        App::new().wrap(cors).service(ask_ai)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

