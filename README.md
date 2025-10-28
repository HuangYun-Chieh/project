Diet-server (後端)

簡介
- Express + MySQL 後端，已新增基本的使用者認證與 Food CRUD 範例。


環境變數
- 將 `.env.example` 複製為 `.env` 並填入資料庫資訊與 `JWT_SECRET`。

SQLite (快速在本機開發)
- 若你沒有 MySQL，可用 SQLite 快速啟動：在 `.env` 中加入 `USE_SQLITE=yes`。
- 可選 `SQLITE_FILE` 指定資料庫檔案位置（預設 `./data/diet.db`）。

快速啟動（SQLite）
1. npm install
2. 在 `.env` 設定：
	USE_SQLITE=yes
	SQLITE_FILE=./data/diet.db
3. 若要建立 schema：執行 Node 腳本或使用 sqlite3 CLI 匯入 `migrations/init.sqlite.sql`。
4. npm run start

快速啟動（MySQL）
1. npm install
2. 建立資料庫並匯入 `migrations/init.sql`
3. 設定 `.env` 的 DB_HOST/DB_USER/DB_PASSWORD/DB_NAME
4. npm run start

主要 API
- POST /api/register { username, password, nickname? } -> 註冊，回傳 JWT
- POST /api/login { username, password } -> 登入，回傳 JWT
- GET /api/foods (auth) -> 取得該使用者食物紀錄
- POST /api/foods (auth) -> 新增食物紀錄 { food_name, calories, meal_type }
- PUT /api/foods/:id (auth) -> 更新紀錄
- DELETE /api/foods/:id (auth) -> 刪除紀錄
- GET /api/users -> 取得使用者列表（管理用途）


測試 DB
- GET /test-db

備註
- 使用者密碼以 bcrypt 儲存在資料庫，認證使用 JWT。前端需要在 Authorization header 中帶上 `Bearer <token>`。

下一步建議
- 把前端的登入/註冊與食物紀錄呼叫改成使用 API（取代 localStorage 直接存取）。
- 加入 Google OAuth2 與 AI 推薦（可在此基礎上延伸）。

Google OAuth2 (選用)
1. 建立 Google Cloud OAuth 2.0 credentials：
	- 到 Google Cloud Console -> APIs & Services -> Credentials -> Create Credentials -> OAuth client ID
	- 設定應用類型為 Web application，加入 Authorized redirect URI，例如 `http://localhost:3000/auth/google/callback`
	- 取得 `CLIENT_ID` 與 `CLIENT_SECRET`。
2. 在 `.env` 加入：
	GOOGLE_CLIENT_ID=your_client_id
	GOOGLE_CLIENT_SECRET=your_client_secret
	GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
	FRONTEND_URL=http://localhost:5500/home.html
3. 安裝依賴（已加入於 package.json）： `passport` 與 `passport-google-oauth20`。
4. 啟動 server，前往 `http://localhost:3000/auth/google` 即可開始 OAuth 流程。

登入成功後 server 會在 redirect 回前端的 URL（`FRONTEND_URL`）並在 fragment 中帶上 `#token=<jwt>`，前端可在載入時檢查 location.hash 並儲存 token 到 sessionStorage。

