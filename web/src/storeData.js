const backgrounds = [
  "bg-[linear-gradient(135deg,#f7d6c2_0%,#df8f67_100%)]",
  "bg-[linear-gradient(135deg,#ead8d1_0%,#c9733c_100%)]",
  "bg-[linear-gradient(135deg,#f1d4cd_0%,#b74141_100%)]",
  "bg-[linear-gradient(135deg,#f6dfb8_0%,#c96645_100%)]"
];

export function mapStore(store, index = 0) {
  return {
    id: String(store.id),
    name: store.name,
    address: store.address,
    phone: store.phone,
    region: store.region || "",
    theme: store.theme || "",
    averagePrice: store.averagePrice,
    summary: store.description || store.address,
    status: store.status,
    availableNow: store.status === "OPEN",
    thumbnail: backgrounds[index % backgrounds.length]
  };
}
