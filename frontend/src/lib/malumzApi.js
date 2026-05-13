import axios from 'axios';

const apiBase = '/api/malumz';
const contactBase = '/api';
const assetBase = '';

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
  const response = await axios.post(`${apiBase}/checkout`, { productId, buyerEmail });
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
