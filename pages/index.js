import { useState } from 'react';
import Link from 'next/link';

function SearchInput(props) {
  const [id, setId] = useState('');
  return (
    <>
      <div>
        <label htmlFor="input">{props.label}</label>
        <input
          type="text"
          placeholder={props.placeholder}
          value={id}
          onChange={e => setId(e.target.value)}
        />
        <Link href={`${props.href}/${id}`}>
          <a>Search</a>
        </Link>
      </div>
      <style jsx>{``}</style>
    </>
  );
}

export default () => (
  <>
    <div>
      {[`allSetsByElement`, `allElementsBySet`].map(query => (
        <SearchInput key={query} label={query} href={`/${query}`} />
      ))}
    </div>
    <style jsx>{``}</style>
  </>
);
