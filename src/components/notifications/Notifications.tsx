import { Activity } from '@subsocial/types';
import React from 'react';
import { config } from 'src/config';
import { fetchPosts } from 'src/store/features/posts/postsSlice';
import { fetchProfiles } from 'src/store/features/profiles/profilesSlice';
import { fetchSpaces } from 'src/store/features/spaces/spacesSlice';
import {
  getNotifications,
  getNotificationsCount,
} from '../utils/OffchainUtils';
import { InnerActivities } from './InnerActivities';
import Notification from './Notification';
import {
  LoadMoreProps,
  ActivityProps,
  LoadMoreFn,
  BaseActivityProps,
} from '../../models/dataActivities';
import { extractEntityIdsFromActivities } from '@subsocial/api/offchain';

export const NotifActivities = ({
  loadMore,
  ...props
}: ActivityProps<Activity>) => {
  return (
    <InnerActivities
      {...props}
      getKey={({ block_number, event_index }) =>
        `${block_number}-${event_index}`
      }
      renderItem={(activity) => <Notification {...activity} />}
      loadMore={loadMore}
    />
  );
};

export const createLoadMoreActivities =
  (getActivity: LoadMoreFn) => async (props: LoadMoreProps) => {
    const { address, page, size, api, dispatch } = props;

    if (!address) return [];

    const offset = (page - 1) * size;

    const activities =
      (await getActivity(address, offset, config.infinityScrollOffset).then(
        (res) => res
      )) || [];

    const {spaceIds, profileIds, postIds}= extractEntityIdsFromActivities(activities);
    
    const fetches: Promise<any>[] = [
      dispatch(fetchSpaces({ ids: spaceIds, api })),
      dispatch(fetchProfiles({ ids: profileIds, api })),
      dispatch(fetchPosts({ ids: postIds, api })),
    ];

    await Promise.all(fetches);

    return activities;
  };

type LoadNotificationsFn = (props: LoadMoreProps) => Promise<Activity[]>;

type LoadMoreNotifications = LoadMoreProps;
const createLoadMoreNotifications =
  (getNotifs: LoadNotificationsFn) => async (props: LoadMoreNotifications) => {
    const { address } = props;

    if (!address) return [];

    const notifications = await getNotifs(props);

    return notifications;
  };

const loadMoreActivities = createLoadMoreActivities(getNotifications);

const loadMoreNotifications = createLoadMoreNotifications(loadMoreActivities);

export const Notifications = ({ address, title }: BaseActivityProps) => {
  const loadMore = (props: LoadMoreProps) => loadMoreNotifications(props);

  return (
    <NotifActivities
      loadMore={loadMore}
      address={address}
      title={title}
      loadingLabel="Loading your notifications..."
      noDataDesc="No notifications for you"
      getCount={getNotificationsCount}
    />
  );
};
