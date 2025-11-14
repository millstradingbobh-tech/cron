const projectId = "npsw7nbt";   // e.g. abc123
const dataset = "production";          // or your dataset name
const token = "skCZe4DUwAqyh5aRF81yrAMCiV1bFhU7FD1dw2LPYqqxQ0wjoqNzDy7cNI7fTXrBZP9Kp9ZO5STGGpMlSrwoE4DaVlnbPpRX8hsYhtlf7MkavLjzutGPtqtYybAfwQj8aTVKQjav4bLK8JURCXMVoRPijq3yO1Z4QyRuKzY2of6iQXmG7IEy"; // optional if dataset is public

export async function test() {
    const query = `
        *[_type == "category" && !defined(parentCategory)]{
...
}
    `;

    const encodedQuery = encodeURIComponent(query);

    const url = `https://${projectId}.api.sanity.io/v2025-11-13/data/query/${dataset}?query=${encodedQuery}`;

    console.log(url)

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));

    return data;
}
