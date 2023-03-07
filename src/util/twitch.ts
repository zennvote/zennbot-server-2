import axios from 'axios';

const twitchGqlUrl = 'https://gql.twitch.tv/gql';

export const getSubscription = async (channel: string, channelId: string, twitchId: string) => {
  const headers = {
    Authorization: `OAuth ${process.env.TWITCH_GQL_CLIENT_AUTH}`,
    'Client-Id': process.env.TWITCH_GQL_CLIENT_ID ?? '',
  };

  const {
    data: [{ data }],
    status,
  } = await axios.post(
    twitchGqlUrl,
    [
      {
        operationName: 'ViewerCard',
        variables: {
          channelID: channelId,
          channelLogin: channel,
          hasChannelID: true,
          giftRecipientLogin: twitchId,
          isViewerBadgeCollectionEnabled: true,
          withStandardGifting: true,
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: '823772cac91efa0a24f86a80463f37f0377cb216d7ce57a4ab90b61d1e01de8b',
          },
        },
      },
    ],
    { headers },
  );

  if (status >= 400) {
    console.log('Looks like we got an error from Twitch', status);
  }

  const { tier: tierString } = data?.targetUser?.relationship?.subscriptionBenefit ?? {};
  if (!tierString) {
    console.log('Looks like we got an wrong value from Twitch', data);
    return null;
  }

  const tier = parseInt(tierString, 10);

  if (tier >= 3000) {
    return 3;
  }
  if (tier >= 2000) {
    return 2;
  }

  return 1;
};
