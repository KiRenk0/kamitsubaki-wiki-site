const copy={
 zh:{databaseLimit:'数据库今日额度已耗尽，账号与投稿服务暂时不可用。请保留本地草稿，在 UTC 00:00（北京时间／新加坡时间 08:00）额度重置后重试。'},
 'zh-tw':{databaseLimit:'資料庫今日額度已耗盡，帳號與投稿服務暫時無法使用。請保留本機草稿，在 UTC 00:00（臺灣／新加坡時間 08:00）額度重設後重試。'},
 'zh-hk':{databaseLimit:'資料庫今日額度已用盡，帳戶與投稿服務暫時無法使用。請保留本機草稿，在 UTC 00:00（香港／新加坡時間 08:00）額度重設後重試。'},
 en:{databaseLimit:'The daily database limit has been reached. Account and contribution services are temporarily unavailable. Keep your local draft and retry after the limit resets at 00:00 UTC.'},
 ja:{databaseLimit:'データベースの日次上限に達したため、アカウントと投稿サービスを利用できません。端末の下書きを保持し、UTC 00:00（日本時間 09:00）のリセット後に再試行してください。'}
};
export const serviceAvailabilityCopy=locale=>copy[locale]||copy.zh;
