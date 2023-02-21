import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from 'react-datepicker'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function App() {
  const DATA_FILTER_TYPES = ["App", "Country", "Platform"]
  const [coreData, setCoreDate] = useState([])
  const [chartOptions, setChartOptions] = useState( {
    plugins: {
      title: {
        display: true,
        text: 'Bar Chart'
      }
    }
  })
  const [chartData, setChartData] = useState({})
  const [filterType, setFilterType] = useState(DATA_FILTER_TYPES[0])
  const [allFilterDataOptions, setAllFilterDataOptions] = useState({})
  const [selectedFilterOptions, setSelectedFilterOptions] = useState([])
  const [selectedDataOption, setSelectedDataOption] = useState("Blast!")

  const [allSortedDates, setAllSortedDates] = useState([])

  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  



  useEffect(() => {
    axios.get("./csvjson.json").then(res=> {
      setCoreDate(res.data)
      resetFilterDateOptions(res.data)
      resetDateRange(res.data)
      updateChartData(getReducedData(res.data,"App", 'Blast!'));
    } )
  }, [])

  const resetDateRange = (data) => {
    const allDatesSet = new Set(data.map(el => el.Date))
    const dates = [...allDatesSet].sort((a, b) => getDateObj(a) - getDateObj(b))
    setAllSortedDates(dates.map(getDateObj))
    setStartDate(getDateObj(dates[0]))
    setEndDate(getDateObj(dates[dates.length - 1]))
  }

  const getDateObj = (dateString) => {
      const parts = dateString.split("/");
      return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  const updateChartData = (data) => {
    setChartData({
      labels: Object.keys(data).sort((a,b) => getDateObj(a) - getDateObj(b)).map(el => getDateObj(el).toLocaleString()),
      datasets: [
        {
          label: 'Users Gained',
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
          borderColor: 'rgb(0, 255, 0)',
          borderWidth: 1,
          data: Object.keys(data).map(el => data[el])
        }
      ]
    },
  )
  }

  const getReducedData = (data, filterType, param) => {
    const dataObj = {}
    data.forEach(el => {
      if (el[filterType] !== param) {
        return;
      }
      if (dataObj[el.Date] ) {
        dataObj[el.Date] = dataObj[el.Date] + el["Daily Users"]
        return
      }
      dataObj[el.Date] = el["Daily Users"]
    })
  return dataObj;
  }

  const handleFilterTypeChange = (e)=>  {
    e.preventDefault();
    setSelectedFilterOptions(allFilterDataOptions[e.target.value])
    setFilterType(e.target.value)
    updateChartData(getReducedData(coreData ,filterType, selectedFilterOptions[0]))
  }

  const resetFilterDateOptions = (data) => {
    const optionsData = {}
    DATA_FILTER_TYPES.forEach(filterType => {
      optionsData[filterType] = [...getAvailableOptionsForFilterType(data, filterType)]
    })
    setAllFilterDataOptions(optionsData)
  }

  const getAvailableOptionsForFilterType = (data, type) => {
    return new Set(data.map(el => el[type]))
  }

  const handleFilterDataChange = (e) => {
    updateChartData(getReducedData(coreData ,filterType, e.target.value));
  }

  const handleStartDateChange = (e) => {
    setStartDate(e)
    const existingChartData = {
      ...chartData
    }
    setChartData({
      ...existingChartData,
      labels: allSortedDates.filter(el => e <= el && el <= endDate).sort((a,b) => a - b).map(el => el.toLocaleString())
    })
  }

  const handleEndDateChange = (e) => {
    setEndDate(e)
    const existingChartData = {
      ...chartData
    }
    setChartData({
      ...existingChartData,
      labels: allSortedDates.filter(el => e >= el && el >= startDate).sort((a,b) => a - b).map(el => el.toLocaleString())
    })
  }

  return (
    <div className="App">
      {chartData.datasets ? <Bar data={chartData} width={100} height={40} options={chartOptions} /> : ""}
      <select onChange={handleFilterTypeChange}>
        { DATA_FILTER_TYPES.map(el => <option key={el} value={el}>{el}</option>)}
      </select>
      <select value={selectedDataOption} onChange={handleFilterDataChange}>
        {
          selectedFilterOptions.map(el => <option key={el} value={el}>{el}</option>)
        }
      </select>


      StartDate: 
      <DatePicker onChange={handleStartDateChange} value={startDate} />
      EndDate:
      <DatePicker onChange={handleEndDateChange} value={endDate} />

    </div>
  );
}
export default App;