use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tower_http::services::ServeDir;

#[derive(Clone, Serialize, Deserialize)]
struct ScoreEntry {
    name: String,
    score: i32,
    date: String,
}

#[derive(Deserialize)]
struct ScoreInput {
    name: Option<String>,
    score: i32,
}

#[derive(Serialize)]
struct LeaderboardResponse {
    scores: Vec<ScoreEntry>,
}

#[derive(Deserialize)]
struct AllQuery {
    all: Option<String>,
}

#[derive(Clone)]
struct AppState {
    scores: Arc<Mutex<Vec<ScoreEntry>>>,
}

async fn get_leaderboard(State(state): State<AppState>, Query(query): Query<AllQuery>) -> Json<LeaderboardResponse> {
    let mut scores = state.scores.lock().unwrap();
    scores.sort_by(|a, b| b.score.cmp(&a.score));
    if query.all.as_deref() != Some("true") {
        scores.truncate(20);
    }
    LeaderboardResponse {
        scores: scores.clone(),
    }
    .into()
}

async fn post_score(
    State(state): State<AppState>,
    Json(input): Json<ScoreInput>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    if input.score < 0 {
        return Err((StatusCode::BAD_REQUEST, "invalid score".into()));
    }
    let entry = ScoreEntry {
        name: input.name.unwrap_or_default().chars().take(12).collect::<String>(),
        score: input.score,
        date: chrono::Utc::now().to_rfc3339(),
    };
    let mut scores = state.scores.lock().unwrap();
    scores.push(entry);
    Ok(Json(serde_json::json!({ "success": true })))
}

#[tokio::main]
async fn main() {
    let state = AppState {
        scores: Arc::new(Mutex::new(Vec::new())),
    };

    let app = Router::new()
        .route("/api/leaderboard", get(get_leaderboard).post(post_score))
        .with_state(state)
        .fallback_service(ServeDir::new("../game").append_index_html_on_directories(true));

    let port = std::env::var("PORT").unwrap_or("3003".into());
    let addr = format!("0.0.0.0:{}", port);

    let host = match std::net::TcpStream::connect("8.8.8.8:53") {
        Ok(s) => s.local_addr().unwrap().ip().to_string(),
        Err(_) => "127.0.0.1".into(),
    };
    println!("Snake server (Rust) running at");
    println!("  Local:   http://localhost:{}", port);
    println!("  Network: http://{}:{}", host, port);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
