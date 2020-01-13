import { useRouter } from 'next/router';
import Error from 'next/error';
import { request } from 'graphql-request';
import Head from 'next/head';
import useSWR from 'swr';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

function AllSetsByElement() {
  const router = useRouter();
  const { data, error } = useSWR(
    `query {
      allSetsByElement(elementId: "${router.query.id}") {
        name
        sets {
          set_num
          name
        }
      }
    }
  `,
    query => request('/api', query),
    {
      revalidateOnFocus: false
    }
  );
  if (error) return <Error statusCode={404} />;

  const columns = [
    {
      Header: 'id',
      accessor: 'set_num',
      filterable: true
    },
    {
      Header: 'Name',
      accessor: 'name',
      filterable: true
    }
  ];

  return (
    <div>
      {data && (
        <Head>
          <title>{data.allSetsByElement.name}</title>
        </Head>
      )}
      <h2>{data ? data.allSetsByElement.name : '...'}</h2>
      <ReactTable
        loading={!data}
        data={data ? data.allSetsByElement.sets : []}
        columns={columns}
        defaultSorted={[
          {
            id: 'name',
            desc: false
          }
        ]}
      />
    </div>
  );
}

export default AllSetsByElement;
