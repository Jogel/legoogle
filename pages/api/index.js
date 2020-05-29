const { ApolloServer, gql } = require('apollo-server-micro');

const rebrickable = async url => {
  const fetch = require('isomorphic-fetch');
  const fullurl = `https://rebrickable.com${url}`;
  const headers = {
    authorization: `key ${process.env.REBRICKABLE_API_KEY}`,
    accept: 'application/json'
  };
  const res = await fetch(fullurl, { headers });
  const content = await res.json();
  console.log({
    req: { fullurl, headers },
    res: { headers: res.headers, content: content }
  });
  return content;
};

const typeDefs = gql`
  type Element {
    part_num: String
    elementId: String
    name: String
    colorId: String
    sets: [Set]
  }

  type SetElement {
    elementId: String
    quantity: String
    numSets: String
    oldElementId: String
  }

  type Set {
    set_num: String
    name: String
    year: String
    setElements: [SetElement]
  }

  type Part {
    partNum: String
    name: String
    year_from: String
    year_to: String
    oneElementId: String
    res4: String
  }

  type PartColor {
    year_from: String
    year_to: String
    elements: String
  }

  type Query {
    allSetsByElement(elementId: String): Element
    allElementsBySet(setNum: String): Set
    partInfo(partNum: String): Part
    partColorInfo(partNum: String, colorId: String ): PartColor
  }
`;

const resolvers = {
  Query: {
    allSetsByElement: async (root, args, context) => {
      const res = await rebrickable(`/api/v3/lego/elements/${args.elementId}`);
      return {
        part_num: res.part.part_num,
        elementId: res.element_id,
        name: res.part.name,
        colorId: res.color.id
      };
    },
    allElementsBySet: async (root, args, context) => {
      const res2 = await rebrickable(`/api/v3/lego/sets/${args.setNum}`);
      return {
        set_num: res2.set_num,
        name: res2.name,
        year: res2.year
      };
    },
    partInfo: async (root, args, context) => {
      const res3 = await rebrickable(`/api/v3/lego/parts/${args.partNum}`);
      const res4 = await rebrickable(`/api/v3/lego/parts/${args.partNum}/colors`);
      // GET /api/v3/lego/parts/{part_num}/colors/
      return {
        partNum: res3.part_num,
        name: res3.name,
        year_from: res3.year_from,
        year_to: res3.year_to,
        oneElementId: (res3.part_img_url.match(/[0-9]/g) || []).join(''),
        res4: JSON.stringify(
          res4.results.map(c => {
            // https://rebrickable.com/api/v3/lego/parts/54091/colors/25/
            return {
              color_name: c.color_name,
              color_id: c.color_id
            }
          }))
        //  JSON.stringify(res4.results[0].color_name))
      };
    },
    // /api/v3/lego/parts/{part_num}/colors/{color_id}/
    partColorInfo: async (root, args, context) => {
      const res4 = await rebrickable(`/api/v3/lego/parts/${args.partNum}/colors/${args.colorId}/`);
      return {
        // partNum: res4.part_num,
        // name: res4.name,
        year_from: res4.year_from,
        year_to: res4.year_to,
        elements: res4.elements.join()
        // elements
        // oneElementId: (res3.part_img_url.match(/[0-9]/g) || []).join('')
      };
    }
  },
  Element: {
    sets: async element => {
      const res = await rebrickable(
        `/api/v3/lego/parts/${element.part_num}/colors/${element.colorId}/sets`
      );
      return res.results.map(r => {
        return {
          set_num: r.set_num,
          name: r.name,
          year: r.year
        };
      });
    }
  },
  Set: {
    setElements: async setEle => {
      const res = await rebrickable(
        `/api/v3/lego/sets/${setEle.set_num}/parts`
      );
      return res.results.map(r => {
        return {
          elementId: r.element_id,
          quantity: r.quantity,
          numSets: r.num_sets,
          oldElementId: (r.part.part_img_url.match(/[0-9]/g) || []).join('')
        };
      });
    }
  }
  // /api/v3/lego/parts/{part_num}/colors/{color_id}/sets/
  // z.B. GET /api/v3/lego/parts/{57893}/colors/{0}/sets/
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

// https://github.com/zeit/next.js/blob/master/examples/api-routes-graphql/pages/api/graphql.js#L22
export const config = {
  api: {
    bodyParser: false
  }
};

export default server.createHandler({ path: '/api' });
