use actix_cors::Cors; // Import the CORS crate
use actix_web::{App, HttpResponse, HttpServer, Responder, post, web};
use reqwest::Client;
use serde::{Deserialize, Serialize};

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

    // The endpoint for Gemini 3 Flash
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
        api_key
    );

    let client = Client::new();

    // Constructing the JSON body for the Gemini API
    let body = serde_json::json!({
        "contents": [{ "parts": [{ "text": req.prompt }] }]
    });

    // 1. Sending the Request to Google
    let res = client.post(url).json(&body).send().await;

    // Replace your match res block with this to see the raw data
    match res {
        Ok(response) => {
            let json: serde_json::Value = response.json().await.unwrap();

            // --- DEBUG PRINT ---
            println!("Full Google Response: {:#?}", json);
            // -------------------

            let ai_text = json["candidates"][0]["content"]["parts"][0]["text"]
                .as_str()
                .unwrap_or("No response content");

            HttpResponse::Ok().json(GeminiResponse {
                text: ai_text.to_string(),
            })
        }
        Err(e) => {
            println!("Request Error: {:?}", e);
            HttpResponse::InternalServerError().body("Error reaching Gemini")
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    println!("Server running on http://localhost:8080");

    HttpServer::new(|| {
        // Configure CORS
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173") // Allow your React app
            .allowed_methods(vec!["POST"]) // Only allow POST
            .allow_any_header() // Allow Content-Type, etc.
            .max_age(3600);

        App::new()
            .wrap(cors) // Add the middleware here!
            .service(ask_ai)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
