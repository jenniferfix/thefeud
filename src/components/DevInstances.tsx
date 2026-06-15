import { ClientOnly, getRouteApi, Link } from '@tanstack/react-router';
import { useGetUserInstances } from '#/hooks/useinstancequeries';
import { LocalDateTime } from './LocalDateTime';

export const DevInstances = () => {
  const { user } = getRouteApi('/_navbar-layout/_auth').useRouteContext();
  const { data } = useGetUserInstances(user.id);

  return (
    <div>
      {data?.map((g) => (
        <Link
          to="/c/$gameInstanceId"
          params={{ gameInstanceId: g.id }}
          key={g.id}
        >
          <ClientOnly>
            <LocalDateTime value={g.created_at} />
          </ClientOnly>
        </Link>
      ))}
    </div>
  );
};
