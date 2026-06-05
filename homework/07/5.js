function fetchData(id, callback) {
    // 建立資料
    const fakeData = { 
        id: id, 
        status: "success" 
    };
    // 呼叫 callback：第一個參數是 err (null 表示無錯)，第二個是資料
    callback(null, fakeData);
}

// 執行
fetchData(101, (err, data) => {
    if (err) {
        console.log("發生錯誤：" + err);
    } else {
        console.log("成功取得資料：", data); 
    }
});