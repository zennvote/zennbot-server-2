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
            sha256Hash: '9afddab81b8b216f9370f3f96662d4cefe9eb5312dc4c133ace70fa0a24ec2af',
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
