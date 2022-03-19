import { FC, useEffect, useState } from 'react';
import { config } from 'src/config'
import { getPageOfIds } from '../../utils/getIds';
import { fetchSpaces } from 'src/store/features/spaces/spacesSlice';
import { useApi } from '../../api';
import { useAppDispatch } from 'src/store/app/store';
import InfinityListScroll from '../../common/infinity-list/InfinityListScroll';
import { Space } from '../space-item/Space';
import {
  InnerLoadMoreFn,
  loadMoreValuesArgs,
} from 'src/models/infinity-scroll';
import { SpaceIds } from 'src/models/profile';
import { useTranslation } from 'react-i18next';

const loadMoreSpacesFn = async (loadMoreValues: loadMoreValuesArgs) => {
  const { size, page, api, dispatch, ids, withUnlisted } = loadMoreValues;

  const spaceIds: string[] = getPageOfIds(ids, { page, size });
  await dispatch(
    fetchSpaces({
      api,
      ids: spaceIds,
      reload: false,
      withUnlisted: withUnlisted,
    })
  );

  return spaceIds;
};

const SpaceList: FC<SpaceIds> = ({ ids, withUnlisted = false }) => {
  const [spaceData, setSpaceData] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const { api } = useApi();
  const [isEmpty, setIsEmpty] = useState(false);
  const { t } = useTranslation();

  const loadMore: InnerLoadMoreFn = (page, size) =>
    loadMoreSpacesFn({
      size,
      page,
      api,
      dispatch,
      ids,
      withUnlisted,
    });

  useEffect(() => {
    let isMounted = true;

    isMounted &&
      loadMore(config.infinityScrollFirstPage, config.infinityScrollOffset).then((ids) => {
        if (!ids.length) {
          setIsEmpty(true);
        }
        setSpaceData(ids);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <InfinityListScroll
      dataSource={spaceData}
      loadMore={loadMore}
      totalCount={ids.length}
      emptyText={t('content.noSpaces')}
      renderItem={(id) => (
        <Space id={id} key={id} withUnlisted={withUnlisted} />
      )}
      isEmpty={isEmpty}
    />
  );
};

export default SpaceList;
