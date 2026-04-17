function checkAdmin(role, callback) {
  if (role !== "admin") {
    // 失敗時，第一個參數傳入錯誤訊息
    return callback("Access Denied");
  }
  // 成功時，第一個參數傳入 null
  callback(null, "Welcome");
}

// 測試有錯誤
checkAdmin("user", (err, msg) => {
  if (err) {
    console.log("失敗情況:", err); // 印出：Access Denied
  } else {
    console.log(msg);
  }
});

// 測試沒錯誤
checkAdmin("admin", (err, msg) => {
  if (err) return console.log(err);
  console.log("成功情況:", msg); // 印出：Welcome
});