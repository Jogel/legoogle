import { useRouter } from 'next/router';
import Error from 'next/error';
import { request } from 'graphql-request';
import Head from 'next/head';
import useSWR from 'swr';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

function AllElementsBySet() {
  const router = useRouter();
  const { data, error } = useSWR(
    // allElementsBySet: async (root, args, context) => {
    //   const res2 = await rebrickable(`/api/v3/lego/sets/${args.setNum}`);
    //   return {
    //     set_num: res2.set_num,
    //     name: res2.name,
    //     year: res2.year
    //   };
    // },

    `query {
      allElementsBySet(setNum: "${router.query.id}") {
        name
        setElements {
          elementId
          quantity
          numSets

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
      accessor: 'elementId',
      filterable: true
    },
    {
      Header: 'Quantity',
      accessor: 'quantity',
      filterable: true
    },
    {
      Header: 'inSets',
      accessor: 'numSets',
      filterable: true
    }
  ];

  return (
    <div>
      {data && (
        <Head>
          <title>{data.allElementsBySet.name}</title>
        </Head>
      )}
      <h2>{data ? data.allElementsBySet.name : '...'}</h2>
      <ReactTable
        loading={!data}
        
        data={data ? data.allElementsBySet.setElements : []}
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

export default AllElementsBySet;
