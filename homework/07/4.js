const params = {};

// 模擬 Express 自動幫你把 URL 的 :id 填入物件的行為
params["id"] = 99; 

console.log(params); // 印出：{ id: 99 }