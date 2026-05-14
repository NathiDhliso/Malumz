import axios from 'axios';

const API_ORIGIN = process.env.REACT_APP_API_URL || 'https://public-api.proprofile.co.za';
const apiBase = `${API_ORIGIN}/public/malumz`;
const contactBase = `${API_ORIGIN}/public/malumz`;
const assetBase = API_ORIGIN;

const withAssetBase = (url) => {
  if (!url || url.startsWith('http')) return url;
  return `${assetBase}${url}`;
};

const normaliseAccess = (data) => ({
  ...data,
  ebookUrl: withAssetBase(data.ebookUrl),
  audioTracks: data.audioTracks?.map((track) => ({
    ...track,
    url: withAssetBase(track.url),
  })),
});

export const checkoutProduct = async ({ productId, buyerEmail }) => {
  const body = { productId };
  if (buyerEmail && buyerEmail.trim()) body.buyerEmail = buyerEmail.trim();
  const response = await axios.post(`${apiBase}/checkout`, body);
  return response.data;
};

export const activatePurchase = async ({ checkoutId }) => {
  const response = await axios.post(`${apiBase}/activate`, { checkoutId });
  return normaliseAccess(response.data);
};

export const submitContact = async (payload) => {
  const response = await axios.post(`${contactBase}/contact`, payload);
  return response.data;
};
