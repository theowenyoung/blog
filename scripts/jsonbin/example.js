let sentArr = [];
const response = await fetch(
  "https://json.owenyoung.com/rss/hackernews/sent?key=abc"
);
if (response.ok) {
  sentArr = await response.json();
} else {
  if (response.status === 404) {
    sentArr = [];
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

console.log("current sentArr", sentArr);

// do some work

sentArr.push("456");

// write the newest sentArr to KV

const writeResponse = await fetch(
  "https://json.owenyoung.com/rss/hackernews/sent?key=abc",
  {
    method: "POST",
    body: JSON.stringify(sentArr),
  }
);

if (!writeResponse.ok) {
  throw new Error(`${writeResponse.status}: ${writeResponse.statusText}`);
}
