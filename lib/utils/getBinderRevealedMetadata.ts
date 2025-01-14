import { NftMetadata } from "alchemy-sdk";
import { getPublicClient } from "../clients";
import { chainIdToRpcUrl } from "../constants";
import { BINDER_DROP_ABI } from "./constants";

export type BinderRevealedMetadata = NftMetadata & {
  image_canvas_data: string;
  isTBA: boolean;
  parent: {
    "parent_contract_address": string,
    "parent_token_id": string,
    "parent_chain_id": string,
    "parent_base_image": string
  }
};

export default async function getBinderRevealedMetadata(
  contractAddress: `0x${string}`,
  tokenId: number | string,
  chainId: number
) {
  const providerUrl = chainIdToRpcUrl[chainId];
  const client = getPublicClient(chainId, providerUrl);

  // response should be an ipfs link for "revealed" art
  // revealed = has been signed on by the artist
  const response = (await client.readContract({
    address: contractAddress,
    abi: BINDER_DROP_ABI,
    functionName: "tokenURI",
    args: [tokenId],
  })) as string;

  const ipfsUrl = response.includes("ipfs://")
    ? response.replace("ipfs://", "https://ipfs.io/ipfs/")
    : response;

  const haharesponse = await fetch("/api", {
    method: "POST",
    body: JSON.stringify({
      ipfsUrl: response,
    }),
  });
  const { url } = await haharesponse.json();
  const fetchedMetadata = (await (await fetch(url)).json()) as BinderRevealedMetadata;

  return fetchedMetadata;
}
