import axios from 'axios';

const twitchGqlUrl = 'https://gql.twitch.tv/gql';

export const getSubscription = async (twitchId: string) => {
  const channel = process.env.TMI_CHANNEL;
  const channelId = process.env.TMI_CHANNEL_ID;

  const headers = {
    Authorization: `OAuth ${process.env.TWITCH_GQL_CLIENT_AUTH}`,
    'Client-Id': process.env.TWITCH_GQL_CLIENT_ID ?? '',
  };

  const {
    data: [{ data }],
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
            sha256Hash: '9afddab81b8b216f9370f3f96662d4cefe9eb5312dc4c133ace70fa0a24ec2af',
          },
        },
      },
    ],
    { headers },
  );

  const { tier: tierString } = data?.targetUser?.relationship?.subscriptionBenefit ?? {};
  if (!tierString) {
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
