# EasyPay Node SDK (TypeScript)

A TypeScript SDK for the EasyPay interface, utilizing Axios for requests.

## Installation

```bash
npm install rainbow-epay-sdk
# or
yarn add rainbow-epay-sdk
```

## Usage

### Initialization
```typescript
import { EasyPay } from 'rainbow-epay-sdk';

const pay = new EasyPay({
  domain: 'http://pay.hackwl.cn',
  pid: 'YOUR_PID',
  key: 'YOUR_KEY',
  notify_url: 'http://example.com/notify', // Optional global default
  return_url: 'http://example.com/return'  // Optional global default
});
```

### 1. Page Jump Payment (submit.php)
Returns a URL. Redirect the user to this URL to complete payment.
```typescript
const url = pay.pay({
  type: 'alipay',
  out_trade_no: '20230101001',
  name: 'Test Product',
  money: '0.01'
  // notify_url and return_url will be used from config if not provided here
});
console.log('Payment URL:', url);
```

### 2. API Payment (mapi.php)
Returns a JSON object containing the payment link (payurl, qrcode, or urlscheme).
```typescript
try {
    const result = await pay.mapi({
        type: 'wxpay',
        out_trade_no: '20230101002',
        name: 'API Payment',
        money: '0.01',
        clientip: '127.0.0.1',
        device: 'pc'
    });
    console.log(result); // { code: 1, payurl: '...', ... }
} catch (err) {
    console.error(err);
}
```

### 3. Query Order
```typescript
async function checkOrder() {
  try {
    const result = await pay.order('20230101001');
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}
```

### 4. Refund (api.php?act=refund)
```typescript
async function undoOrder() {
  try {
    // trade_no (system) or out_trade_no (merchant), money defaults to full
    const result = await pay.refund(null, '20230101001', '0.01'); 
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}
```

## Methods
- `pay(args)`: Page Jump (GET URL)
- `mapi(args)`: API Payment (POST JSON)
- `query()`: Merchant Info
- `settle()`: Settlement Records
- `order(out_trade_no)`: Single Order Query
- `orders()`: Batch Order Query
- `refund(trade_no, out_trade_no, money)`: Refund

## License
MIT
