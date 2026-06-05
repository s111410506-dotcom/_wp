function fakeGet(sql, params, callback) {
    const fakeRow = { 
        id: 1, 
        title: "掌握 JavaScript 函數", 
        content: "這是一篇關於 Callback 的文章..." 
    };
    
    // 模擬資料庫完成後回傳資料
    callback(null, fakeRow);
}

fakeGet("SELECT * FROM posts WHERE id = ?", [1], (err, row) => {
    if (err) {
        console.error("查詢失敗");
    } else {
        // 練習：印出該文章的 title
        console.log("抓到的文章標題是：", row.title);
    }
});