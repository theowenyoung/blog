// use deno offcial dotenv to load env
import "jsr:@std/dotenv/load";

async function getLatestOperation(idToken:string){
    const newestOperations = await getSp500History(idToken);
    // to text
    const text = `${newestOperations[1][1]}, ${newestOperations[1][0]}, sp500 指数 ${newestOperations[1][2]} \n上次操作：${newestOperations[0][1]}, ${newestOperations[0][0]}, sp500 指数 ${newestOperations[0][2]}`;
    return text;
}
async function getIdToken(){
    const refreshToken = Deno.env.get("GRIZZLYBULLS_REFRESH_TOKEN");
    const apiKey = Deno.env.get("GRIZZLYBULLS_API_KEY");
    const jwtTokenResult = await refreshFirebaseToken(refreshToken, apiKey);
    const idToken = jwtTokenResult.idToken;
    return idToken;
}
export async function checkSp500Signal(){
    const idToken = await getIdToken();
    const text = await getLatestOperation(idToken);
    // write text to deno kv, if text is different from the last one, send a telegram message
    const kv = await Deno.openKv();
    const lastText = await kv.get(["sp500_signal"]);
    console.log('lastText', lastText);
    if (lastText && lastText.value === text) {
        console.log("text is the same as the last one");
    } else {
        console.log("text is different from the last one");
        // send a telegram message
        await sendMessageToTelegram(`grizzlybulls 有新操作：${text}`);
        await kv.set(["sp500_signal"], text);
    }
}

export async function manualGetSp500Signal(){
    const idToken = await getIdToken();
    const text = await getLatestOperation(idToken);
    await sendMessageToTelegram(`grizzlybulls 有新操作：${text}`);
}



async function sendMessageToTelegram(text:string){
    const telegramToken = Deno.env.get("GRIZZLYBULLS_TELEGRAM_BOT_TOKEN");
    const telegramChatId = Deno.env.get("GRIZZLYBULLS_TELEGRAM_CHAT_ID");
    const telegramMessage = `${text}`;
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramMessage
        })
    });
    const status = telegramResponse.status;
    const telegramData = await telegramResponse.json();
    if(status === 200){
        console.log("telegram message sent successfully");
    }else{
        console.log("telegram message sent failed");    
        console.log(telegramData);
        throw new Error("telegram message sent failed");
    }

}



async function getSp500History(idToken: string){
    const url ='https://grizzlybulls.com/api/modelsHistorical?slug=vix-basic';
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `${idToken}`
        }
    });
    const data = await response.json();
    const sheetData = data.sheetData;
    // the last row is rubish, so we need to remove it
    const newestOperations = sheetData.slice(-3,-1);
    return newestOperations;
}

// Firebase Token 刷新相关的类型定义
interface FirebaseTokenResponse {
    id_token: string;
    refresh_token: string;
    expires_in: string;
    user_id: string;
    token_type: string;
    project_id: string;
  }
  
  interface RefreshTokenResult {
    idToken: string;
    refreshToken: string;
    expiresIn: number;
    userId: string;
  }
  
  interface FirebaseError {
    error: {
      code: number;
      message: string;
      errors: Array<{
        message: string;
        domain: string;
        reason: string;
      }>;
    };
  }
  
  /**
   * 使用 refresh token 获取新的 Firebase ID token
   * @param refreshToken - Firebase refresh token
   * @param apiKey - Firebase Web API Key
   * @returns Promise<RefreshTokenResult>
   */
  export async function refreshFirebaseToken(
    refreshToken: string,
    apiKey: string
  ): Promise<RefreshTokenResult> {
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString()
      });
  
      if (!response.ok) {
        const errorData: FirebaseError = await response.json();
        throw new Error(
          `Firebase token refresh failed: ${errorData.error.message} (Code: ${errorData.error.code})`
        );
      }
  
      const data: FirebaseTokenResponse = await response.json();
      
      return {
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresIn: parseInt(data.expires_in),
        userId: data.user_id
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Token refresh failed: ${error.message}`);
      }
      throw new Error('Unknown error occurred during token refresh');
    }
  }