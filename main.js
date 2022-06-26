import { parse } from "https://deno.land/std@0.145.0/flags/mod.ts";

const PROXY_BASE = "http://127.0.0.1:9090/proxies"

async function getProxies() {
  const response = await fetch(PROXY_BASE + "/SelectGroup");
  const json = await response.json();
  return json["all"]
}

async function getProxy() {
  const response = await fetch(PROXY_BASE + "/SelectGroup");
  const json = await response.json();
  console.log(json["now"]);
}

async function getDelay(name, timeout, url) {
  const response = await fetch(PROXY_BASE + `/${name}/delay?timeout=${timeout}&url=${url}`);
  const json = await response.json();
  return json["delay"];
}

async function getDelays(timeout, url) {
  console.log("This may take a few seconds...");
  const proxies = await getProxies();
  const delays = await Promise.all(proxies.map(p => getDelay(p, timeout, url)));
  const result = {};
  for (let i in delays) {
    result[proxies[i]] = delays[i];
  }
  console.table(result);
}

async function setProxy(name) {
  const response = await fetch(PROXY_BASE + "/SelectGroup", {
    method: "PUT",
    body: JSON.stringify({"name": name})
  });
  if (response.status == 204) {
    console.log("success!")
  } else {
    console.error("error:")
    console.error(await response.json());
  };
}

const parsed = parse(Deno.args);

if (parsed["_"][0] == "delay") {
  const url = parsed["url"] ?? "https://google.com";
  const timeout = parsed["timeout"] ?? 5000;
  await getDelays(timeout, url);
} else if (parsed["_"][0] == "set") {
  const name = parsed["_"][1];
  if (!name) {
    console.error("must specify a name to set");
  }
  await setProxy(name);
} else if (parsed["_"][0] == "get") {
  await getProxy();
} else {
  console.error("must specify `delay` or `set` or `get`");
}

