import axios, { type AxiosInstance } from "axios";
import { createHash } from "crypto";

export interface EasyPayConfig {
  domain: string;
  pid: string;
  key: string;
  notify_url?: string;
  return_url?: string;
}

export interface PaymentArgs {
  type: string;
  out_trade_no: string;
  notify_url?: string;
  return_url?: string;
  name: string;
  money: string;
  sitename?: string;
  params?: string;
  [key: string]: any;
}

export interface APIPaymentArgs extends PaymentArgs {
  clientip?: string;
  device?: "pc" | "mobile" | "qq" | "wechat" | "alipay";
}

export class EasyPay {
  private domain: string;
  private pid: string;
  private key: string;
  private notify_url?: string;
  private return_url?: string;
  private instance: AxiosInstance;

  constructor(config: EasyPayConfig) {
    this.domain = config.domain.replace(/\/$/, ""); // Remove trailing slash
    this.pid = config.pid;
    this.key = config.key;
    this.notify_url = config.notify_url;
    this.return_url = config.return_url;
    this.instance = axios.create({
      baseURL: this.domain,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * Sort object keys alphabetically and filter empty values
   */
  private ksort(inputArr: { [key: string]: any }): { [key: string]: any } {
    const keys = Object.keys(inputArr).sort();
    const sortedObj: { [key: string]: any } = {};
    for (const key of keys) {
      // Filter out empty values, sign, and sign_type
      if (
        inputArr[key] !== undefined &&
        inputArr[key] !== "" &&
        inputArr[key] !== null &&
        key !== "sign" &&
        key !== "sign_type"
      ) {
        sortedObj[key] = inputArr[key];
      }
    }
    return sortedObj;
  }

  /**
   * Encrypt string with MD5
   */
  private md5(content: string): string {
    return createHash("md5").update(content).digest("hex");
  }

  /**
   * Generate signature
   */
  private generateSign(params: { [key: string]: any }): string {
    const sortedParams = this.ksort(params);
    let signStr = "";

    for (const key in sortedParams) {
      signStr += `${key}=${sortedParams[key]}&`;
    }

    // Remove last '&' and append key
    signStr = signStr.substring(0, signStr.length - 1) + this.key;

    return this.md5(signStr);
  }

  /**
   * Helper to merge defaults
   */
  private mergeArgs(args: PaymentArgs) {
    return {
      pid: this.pid,
      notify_url: this.notify_url,
      return_url: this.return_url,
      ...args,
    };
  }

  /**
   * Page Jump Payment (submit.php)
   * Returns a URL string for the user to visit (GET method)
   */
  public pay(args: PaymentArgs): string {
    const config = this.mergeArgs(args);
    const sign = this.generateSign(config);

    const finalParams = {
      ...config,
      sign,
      sign_type: "MD5",
    };

    const url = new URL(`${this.domain}/submit.php`);
    Object.entries(finalParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.append(k, String(v));
      }
    });

    return url.toString();
  }

  /**
   * API Payment (mapi.php)
   * Returns JSON response with payurl or qrcode
   */
  public async mapi(args: APIPaymentArgs): Promise<any> {
    const config = this.mergeArgs(args);
    const sign = this.generateSign(config);

    const params = new URLSearchParams();
    Object.entries({ ...config, sign, sign_type: "MD5" }).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });

    try {
      const { data } = await this.instance.post("/mapi.php", params);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * API-Query Merchant Info
   */
  public async query(): Promise<any> {
    const config = {
      act: "query",
      pid: this.pid,
      key: this.key,
    };
    try {
      const { data } = await this.instance.get("/api.php", { params: config });
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * API-Query Settlement Records
   */
  public async settle(): Promise<any> {
    const config = {
      act: "settle",
      pid: this.pid,
      key: this.key,
    };
    try {
      const { data } = await this.instance.get("/api.php", { params: config });
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * API-Query Single Order
   */
  public async order(out_trade_no?: string, trade_no?: string): Promise<any> {
    const config = {
      act: "order",
      pid: this.pid,
      key: this.key,
      out_trade_no,
      trade_no,
    };
    try {
      const { data } = await this.instance.get("/api.php", { params: config });
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * API-Batch Query Orders
   */
  public async orders(): Promise<any> {
    const config = {
      act: "orders",
      pid: this.pid,
      key: this.key,
    };
    try {
      const { data } = await this.instance.get("/api.php", { params: config });
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * API-Order Refund
   */
  public async refund(
    trade_no: string | null,
    out_trade_no?: string,
    money?: string
  ): Promise<any> {
    if (!trade_no && !out_trade_no) {
      throw new Error("Either trade_no or out_trade_no is required");
    }

    const config: any = {
      act: "refund",
      pid: this.pid,
      key: this.key,
    };

    if (trade_no) config.trade_no = trade_no;
    if (out_trade_no) config.out_trade_no = out_trade_no;
    if (money) config.money = money;

    try {
      // refund seems to be GET or POST, doc says POST usually for actions but let's check doc
      // Doc chunk says: POST for refund
      const params = new URLSearchParams();
      Object.entries(config).forEach(([k, v]) => params.append(k, String(v)));

      const { data } = await this.instance.post("/api.php", params);
      return data;
    } catch (error) {
      throw error;
    }
  }
}
