import React, { useState, useEffect } from 'react';
import './App.scss';
import {Table} from './components/Table'

function NumberRangeColumnFilter({column: { filterValue = [], preFilteredRows, setFilter, id }}) {
    const [min, max] = React.useMemo(() => {
        let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
        let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
        preFilteredRows.forEach(row => {
            min = Math.min(row.values[id], min);
            max = Math.max(row.values[id], max);
        });

        return [min, max]
    }, [id, preFilteredRows])

    return (
        <div style={{display: 'flex'}}>
            <input
                value={filterValue[0] || ''}
                type="number"
                onChange={e => {
                  const val = e.target.value
                  setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]])
                }}
                placeholder={`Min (${min})`}
                style={{
                  width: '70px',
                  marginRight: '0.5rem',
                }}
            />
            to
            <input
                value={filterValue[1] || ''}
                type="number"
                onChange={e => {
                  const val = e.target.value
                  setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined])
                }}
                placeholder={`Max (${max})`}
                style={{
                  width: '70px',
                  marginLeft: '0.5rem',
                }}
            />
        </div>
    )
};
const App = () => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const columns = React.useMemo(() => [
        {
            Header: 'Title',
            accessor: 'title'
        },
        {
            Header: 'Url',
            accessor: 'viewItemURL',
            Cell: prop => <a href={prop.value}>{prop.value}</a>
        },
        {
            Header: 'Price',
            accessor: 'price',
            Filter: NumberRangeColumnFilter,
            filter: 'between'
        },
        {
            Header: 'Currency',
            accessor: 'currency'
        },
        {
            Header: 'Country',
            accessor: 'country'
        },
        {
            Header: 'Location',
            accessor: 'location'
        },
        {
            Header: 'ShippingInfo',
            accessor: 'shippingInfo'
        }
    ], []);

    useEffect(() => {
        if (search === '') return
        const url = `/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=WandoInt-217b-42d8-a699-e79808dd505e&keywords=${search}&RESPONSE-DATA-FORMAT=JSON`;
        
        fetch(url)
            .then(result => result.json())
            .then(itemList => {
                const findItemResponse = itemList.findItemsByKeywordsResponse[0];
                const {searchResult} = findItemResponse;
                
                if (searchResult && searchResult.length > 0) {
                    searchResult[0].item && createData(searchResult[0].item);
                } else {
                    setData([]);
                }
            })
            .catch(e => console.log(e));
    }, [search]);

    const searchHandler = function (event) {
       setSearch(event.target.value);
    };
    const createData = (list) => {
        let data = [];
        list.forEach(item => {
            data.push({
                title: item.title,
                viewItemURL: item.viewItemURL,
                price: item.sellingStatus[0].currentPrice[0].__value__,
                currency: item.sellingStatus[0].currentPrice[0]['@currencyId'],
                country: item.country,
                location: item.location,
                shippingInfo: item.shippingInfo[0].shipToLocations[0]
            });
        });
        setData(data);
    };
    
    return (
        <>
            <div className="search-area">
                Search by: <input value={search} type="text" onChange={searchHandler}/>
            </div>
            {(search === '')
                ? <p>Enter keywords in text field to start new search.</p>
                : (data.length > 0 ? <Table columns={columns} data={data} /> : <p>No results</p>)
            }
        </>
    )
};

export default App;