-- Active: 1765259103367@@127.0.0.1@3306
CREATE USER IF NOT EXISTS 'diet_user'@'localhost' IDENTIFIED BY 'Di3t!2024@Db';

-- 2. 🔥 強制重設密碼 (不管原本是什麼，通通改成這組)
ALTER USER 'diet_user'@'localhost' IDENTIFIED BY 'Di3t!2024@Db';

-- 3. 給予全部權限
GRANT ALL PRIVILEGES ON *.* TO 'diet_user'@'localhost' WITH GRANT OPTION;

-- 4. 讓設定生效
FLUSH PRIVILEGES;