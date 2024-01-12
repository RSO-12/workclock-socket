import translations from "./translations.ts";

const fetchSwearWords = async () => {
    const response = await fetch('https://gist.githubusercontent.com/takatama/b4587f6509489a529bbcd87e1a96a3f2/raw/74d49818f1dc7bace7ff044e993d70221d02cef4/swear-words.json');
    if (!response.ok) {
        throw new Error('Failed to fetch swear words');
    }

    return await response.json();
};

async function getIpInfo(ipAddress: string): Promise<any> {
    try {
        const apiUrl = `https://ipinfo.io/${ipAddress}/json`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch IP geolocation data. Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching IP geolocation data:", error.message);
        throw error;
    }
}

export const getSupportedLanguages = () => {
    return new Set([...Object.keys(translations)]);
};

export function getCurrentDateTimeFormatted(): string {
    const now = new Date();
    const day = String(now.getDate());
    const month = String(now.getMonth() + 1);
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export async function censorMessage(message: string): Promise<string> {
    const curseWords: string[] = await fetchSwearWords();
    for (const curse of curseWords) {
        const regex = new RegExp(curse, 'gi');
        message = message.replace(regex, '****');
    }
    return message;
}

export async function getLangCode(ipAddress: string): Promise<string> {
    try {
        const data = await getIpInfo(ipAddress);
        const langCode = data?.country?.toLowerCase() ?? 'en';
        console.log(`[Workclock-socket] Language code for IP ${ipAddress} is ${langCode}`);
        return langCode;
    } catch (error) {
        console.error("Error fetching IP geolocation data:", error.message);
        throw error;
    }
}

export function _t(langCode: string, key: string): string {
    const lang = getSupportedLanguages().has(langCode) ? langCode : 'en';
    return translations?.[lang]?.[key] ?? `Uknown translation key ${key}`
}