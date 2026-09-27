import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface PerformanceTrendChartProps {
  dataPoints?: number[];
  winRate?: number;
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  dataPoints = [65, 70, 68, 75, 82, 78, 85],
  winRate = 78
}) => {
  const { activeTheme } = useTheme();

  const width = 310;
  const height = 120;
  const paddingX = 16;
  const paddingY = 20;

  const minVal = 50;
  const maxVal = 100;
  const range = maxVal - minVal;

  const points = dataPoints.map((val, idx) => {
    const x = paddingX + (idx / (dataPoints.length - 1)) * (width - paddingX * 2);
    const normalizedY = (val - minVal) / range;
    const y = height - paddingY - normalizedY * (height - paddingY * 2);
    return { x, y, val };
  });

  // Build SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    pathD += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Performans Grafiği</Text>
          <Text style={styles.subtitle}>Son 7 Oyun Kazanma Eğilimi</Text>
        </View>
        <View style={[styles.ratePill, { backgroundColor: `${activeTheme.primary}20` }]}>
          <Text style={[styles.rateText, { color: activeTheme.primary }]}>%{winRate} Ortalama</Text>
        </View>
      </View>

      <Svg width={width} height={height} style={styles.svg}>
        <Defs>
          <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={activeTheme.primary} stopOpacity="0.45" />
            <Stop offset="1" stopColor={activeTheme.primary} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        <Line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke={activeTheme.border} strokeDasharray="3,3" />
        <Line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke={activeTheme.border} strokeDasharray="3,3" />
        <Line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke={activeTheme.border} strokeDasharray="3,3" />

        {/* Gradient Area Fill */}
        <Path d={fillD} fill="url(#chartGrad)" />

        {/* Primary Trend Line */}
        <Path d={pathD} fill="none" stroke={activeTheme.primary} strokeWidth="3" />

        {/* Dots */}
        {points.map((p, idx) => (
          <Circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={idx === points.length - 1 ? 5 : 3.5}
            fill={activeTheme.card}
            stroke={activeTheme.primary}
            strokeWidth="2.5"
          />
        ))}
      </Svg>

      <View style={styles.daysRow}>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => (
          <Text key={i} style={styles.dayText}>{day}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F4F5'
  },
  subtitle: {
    fontSize: 10,
    color: '#71717A',
    marginTop: 1
  },
  ratePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  rateText: {
    fontSize: 11,
    fontWeight: '800'
  },
  svg: {
    alignSelf: 'center',
    marginVertical: 4
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12
  },
  dayText: {
    fontSize: 9,
    color: '#71717A',
    fontWeight: '600'
  }
});
