const wunderbar = require('@gribnoysup/wunderbar');
const eol = require('os').EOL;

import {Timing, ChartOptions} from '../../types/types';
const Logger = require('../utils/logger');
const logger = Logger.getInstance();

const drawChart = (timings: Timing[], options: ChartOptions) => {
  const {lmargin, width, xlabel, xmin, xmax} = options;

  const normalizedTimings = timings.map(value => {
    return {
      value: value.timing,
      label: value.title,
      color: value.color
    };
  });

  const {__raw} = wunderbar(normalizedTimings, {
    min: xmin,
    max: xmax,
    length: width,
    format: '0,000'
  });

  const {normalizedValues, minValueFormatted, maxValueFormatted} = __raw;

  const yAxis = '│';
  const xAxis = '─';
  const corner = '╰';

  const padding = ' '.repeat(lmargin);

  const chart = normalizedValues
    .reverse()
    .map((value: {label: string; coloredChartBar: string; formattedValue: string}) => {
      const pad = lmargin - value.label.length;
      const paddedLabel = ' '.repeat(pad > 0 ? pad : 0) + value.label;

      return `${paddedLabel} ${yAxis}${value.coloredChartBar} ${value.formattedValue}`;
    })
    .join(`${eol}${padding} ${yAxis}${eol}`);

  const chartTop = `${padding} ${yAxis}`;

  const chartBottom = `${padding} ${corner}${xAxis.repeat(width)}`;

  const labelPadding = ' '.repeat(Math.max(0, (width - xlabel.length - 2) / 2));

  const chartScale = `${padding}  ${minValueFormatted}${labelPadding}${xlabel}${labelPadding}${maxValueFormatted}`;

  logger.log('');
  logger.log([chartTop, chart, chartBottom, chartScale].join(eol));
  logger.log('');
};

module.exports = drawChart;
