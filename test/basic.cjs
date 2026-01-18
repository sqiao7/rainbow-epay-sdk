const { EasyPay } = require("../dist/index.cjs");

function runBasicTest() {
  const pay = new EasyPay({
    domain: "http://pay.hackwl.cn",
    pid: "1000",
    key: "TEST_KEY",
  });

  const url = pay.pay({
    type: "alipay",
    out_trade_no: "TEST_ORDER_1001",
    name: "SDK Test Product",
    money: "0.01",
  });

  if (typeof url !== "string" || !url.includes("submit.php")) {
    throw new Error("Generated payment URL is invalid: " + url);
  }

  console.log("Test passed, payment URL:", url);
}

runBasicTest();

