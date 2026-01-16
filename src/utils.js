export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

export const storage = {
    get: (key, defaultValue) => {
        return JSON.parse(localStorage.getItem(key) || defaultValue);
    },
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    points: 'PONTOS'
}