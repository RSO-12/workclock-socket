const fetchSwearWords = async () => {
    const response = await fetch('https://gist.githubusercontent.com/takatama/b4587f6509489a529bbcd87e1a96a3f2/raw/74d49818f1dc7bace7ff044e993d70221d02cef4/swear-words.json');
    if (!response.ok) {
        throw new Error('Failed to fetch swear words');
    }

    return await response.json();
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