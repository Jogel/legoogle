import { request } from 'graphql-request';
import useSWR from 'swr';

function Index() {
  const { data, error } = useSWR(
    `query {
      allSetsByElement(elementId: "4546207") {
        name
          sets {
            name
            set_num
          }
      }
    }
  `,
    query => request('/api', query)
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default Index;
