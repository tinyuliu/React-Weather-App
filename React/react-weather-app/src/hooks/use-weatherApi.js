import { useState, useEffect, useCallback } from 'react';


const fetchCurrentWeather = () => {
    // STEP 3-1：修改函式，把 fetch API 回傳的 Promise 直接回傳出去
    return fetch(
      'https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-CAE05173-BB3A-4BE1-A687-7F8ADBE5A745&locationName=臺北',
    )
      .then(response => response.json())
      .then(data => {
        const locationData = data.records.location[0];
  
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
            }
            return neededElements;
          },
          {},
        );
  
        // STEP 3-2：把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
        return {
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        };
      });
  };
  
  const fetchWeatherForecast = () => {
    // STEP 4-1：修改函式，把 fetch API 回傳的 Promise 直接回傳出去
    return fetch(
      'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-CAE05173-BB3A-4BE1-A687-7F8ADBE5A745&locationName=臺北市',
    )
      .then(response => response.json())
      .then(data => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
              neededElements[item.elementName] = item.time[0].parameter;
            }
            return neededElements;
          },
          {},
        );
  
        // STEP 4-2：把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
        return {
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      });
  };


const useWeatherApi = () => {
    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        humid: 0,
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
        isLoading: true,
      });

      const fetchData = useCallback(() => {
        const fetchingData = async () => {
          const [currentWeather, weatherForecast] = await Promise.all([
            fetchCurrentWeather(),
            fetchWeatherForecast(),
          ]);
      
          setWeatherElement({
            ...currentWeather,
            ...weatherForecast,
            isLoading: false,
          });
        };
    
        setWeatherElement(prevState => ({
          ...prevState,
          isLoading: true,
        }));
    
        fetchingData();
      }, []);

      useEffect(() => {
        console.log('execute function in useEffect');
        fetchData();
      }, [fetchData]);

      return [weatherElement, fetchData];

}

export default useWeatherApi;