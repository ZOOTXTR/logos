import React from 'react';
import { View, Text } from 'react-native';
import { Svg, Path, Circle, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';

export function TimeHistoryChart({ scores, theme, language }: { scores: any[]; theme: any; language: string }) {
  // Filter for speed/classic games with valid times, take last 6
  const validScores = scores
    .filter(s => typeof s.timeSeconds === 'number' && s.timeSeconds > 0)
    .reverse()
    .slice(-6);

  if (validScores.length < 2) {
    return (
      <View style={{ padding: SPACING.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: theme.colors.border, minHeight: 120 }}>
        <Text style={{ fontSize: 24, marginBottom: 8 }}>📈</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: FONTS.size.sm, textAlign: 'center', fontWeight: '600' }}>
          {language === 'en'
            ? 'Play more games with time trackers to unlock speed statistics!'
            : 'Süre grafiğini açmak için süreli modda daha fazla oyun tamamlayın!'}
        </Text>
      </View>
    );
  }

  const times = validScores.map(s => s.timeSeconds as number);
  const maxTime = Math.max(...times, 10);
  const minTime = Math.min(...times, 0);
  const chartHeight = 110;
  const chartWidth = 310;
  const paddingX = 25;
  const paddingY = 15;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  const points = times.map((t, idx) => {
    const x = paddingX + (idx * (graphWidth / (times.length - 1)));
    const y = paddingY + graphHeight - ((t - minTime) / (maxTime - minTime || 1)) * graphHeight;
    return { x, y, value: t };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + graphHeight} L ${points[0].x} ${paddingY + graphHeight} Z`;

  return (
    <View style={{ alignItems: 'center', marginVertical: SPACING.md }}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <SvgLinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.colors.accent} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0.0} />
          </SvgLinearGradient>
        </Defs>

        <Path d={areaD} fill="url(#chartGrad)" />
        <Path d={pathD} fill="none" stroke={theme.colors.accent} strokeWidth={3} />

        {points.map((pt, idx) => (
          <React.Fragment key={idx}>
            <Circle
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill={theme.colors.surface}
              stroke={theme.colors.accent}
              strokeWidth={2}
            />
            <SvgText
              x={pt.x}
              y={pt.y - 8}
              fill={theme.colors.text}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              {pt.value}s
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
