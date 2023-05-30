import React, { useState, useEffect } from 'react';
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, Legend, Category, StackingColumnSeries, Tooltip } from '@syncfusion/ej2-react-charts';
import { createClient } from "@supabase/supabase-js";
import { useStateContext } from '../../contexts/ContextProvider';

const supabaseUrl = 'https://aehwgrirrnhmatqmqcsa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlaHdncmlycm5obWF0cW1xY3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MDg2NTg4MywiZXhwIjoxOTk2NDQxODgzfQ.DeXxoWY65kzpbvdxME16mAHj2KGMwDRg_jEGgUIxKc0';
const supabase = createClient(supabaseUrl, supabaseKey);

var stackedCustomSeries = [
  {
    dataSource: [0],
    xName: 'x',
    yName: 'y',
    name: 'Revenue',
    type: 'StackingColumn',
    background: 'blue',
  },
  {
    dataSource: [1],
    xName: 'x',
    yName: 'y',
    name: 'Pencentage of Revenue ÷100',
    type: 'StackingColumn',
    background: 'red',
  },
];

var stackedPrimaryXAxis = {
  majorGridLines: { width: 0 },
  minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
  interval: 1,
  lineStyle: { width: 0 },
  labelIntersectAction: 'Rotate45',
  valueType: 'Category',
};

var stackedPrimaryYAxis = {
  lineStyle: { width: 0 },
  minimum: 0,
  maximum: 24000,
  interval: 2000,
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  minorGridLines: { width: 1 },
  minorTickLines: { width: 0 },
  labelFormat: '{value}',
};

var Stacked = ({ width, height }) => {
  const { currentMode } = useStateContext();
  const [stackedBarData, setStackedBarData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const fetchStackedBarData = async () => {
      let { data: stackedBarData, error } = await supabase
        .from('sales_data_entry')
        .select('*, product:products_data_entry(*)')
        .eq('sales_man_name', 'LWH');

      if (error) {
        setFetchError('Could not fetch data from sales_data_entry');
        setStackedBarData(null);
        console.log('error', error);
      }

      if (stackedBarData) {
        setFetchError(null);
        setStackedBarData(stackedBarData);

        var newStackedChartData = [];
        var newStackedChartData2 = [];
        var totalRevenue = 0;

        stackedBarData.forEach((item) => {
          const revenue = item['quantity'] * item['product']['unit_price'];
          const product_name = item['product']['product_name'];

          totalRevenue += revenue;

          const productIndex = newStackedChartData.findIndex((item) => item['x'] === product_name);
          if (productIndex === -1) {
            newStackedChartData.push({
              x: product_name,
              y: revenue,
            });
          } else {
            newStackedChartData[productIndex]['y'] += revenue;
          }
        });

        newStackedChartData.forEach((item) => {
          const revenue = item['y'];
          const percentage = (revenue / totalRevenue) * 10000;
          const percentageRounded = Number(percentage.toFixed(2));

          newStackedChartData2.push({
            x: item['x'],
            y: percentageRounded,
          });
        });

        newStackedChartData.sort((a, b) => b['y'] - a['y']);
        newStackedChartData2.sort((a, b) => b['y'] - a['y']);

        stackedCustomSeries[0]['dataSource'] = newStackedChartData;
        stackedCustomSeries[1]['dataSource'] = newStackedChartData2;

        console.log(stackedCustomSeries[0]['dataSource']);
        console.log(stackedCustomSeries[1]['dataSource']);

        setChartKey(prevKey => prevKey + 1);

        var titleElement = document.getElementById('title');
        titleElement.innerHTML = 'Top Sales Product (Grand Total %)';
        // Highest and lowest revenue
        var highestRevenue = newStackedChartData[0]['y'];
        var lowestRevenue = newStackedChartData[0]['y'];

        newStackedChartData.forEach((item) => {
          if (item['y'] > highestRevenue) {
            highestRevenue = item['y'];
          }

          if (item['y'] < lowestRevenue) {
            lowestRevenue = item['y'];
          }
        });

        var highestRevenueElement = document.getElementById('highestRevenue');
        highestRevenueElement.innerHTML = 'RM ' + highestRevenue.toString();

        var lowestRevenueElement = document.getElementById('lowestRevenue');
        lowestRevenueElement.innerHTML = 'RM ' + lowestRevenue.toString();

        // Percentage
        var highestPercentage = newStackedChartData2[0]['y'];
        newStackedChartData2.forEach((item) => {
          if (item['y'] > highestPercentage) {
            highestPercentage = item['y'];
          }
        });

        // round the percentage to 2 decimal places
        var highestPercentageRounded = highestPercentage * 0.01;
        var highestPercentageElement = document.getElementById('highestRevenuePercentage');
        highestPercentageElement.innerHTML = highestPercentageRounded.toFixed(2).toString() + ' %';
      }
    };

    fetchStackedBarData();
  }, []);

  return (
    <ChartComponent
      key={chartKey}
      primaryXAxis={stackedPrimaryXAxis}
      primaryYAxis={stackedPrimaryYAxis}
      width={width}
      height={height}
      chartArea={{ border: { width: 0 } }}
      tooltip={{ enable: true }}
      background={currentMode === 'Dark' ? '#33373E' : '#fff'}
      legendSettings={{ background: 'white' }}
    >
      <Inject services={[StackingColumnSeries, Category, Legend, Tooltip]} />
      <SeriesCollectionDirective>
        {stackedCustomSeries.map((item, index) => <SeriesDirective key={index} {...item} />)}
      </SeriesCollectionDirective>
    </ChartComponent>
  );
};

export default Stacked;
