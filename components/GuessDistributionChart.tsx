import React from 'react';
import { View } from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { SPACING } from '../constants/theme';

export function GuessDistributionChart({ distribution, theme }: { distribution: Record<number, number>; theme: any }) {
  const values = [1, 2, 3, 4, 5, 6].map(k => distribution[k] || 0);
  const maxValue = Math.max(...values, 1);
  const chartHeight = 110;
  const chartWidth = 300;
  const barWidth = 32;
  const gap = 16;

  return (
    <View style={{ alignItems: 'center', marginVertical: SPACING.md }}>
      <Svg width={chartWidth} height={chartHeight + 25}>
        {values.map((val, idx) => {
          const barHeight = (val / maxValue) * chartHeight;
          const x = idx * (barWidth + gap) + 10;
          const y = chartHeight - barHeight;
          return (
            <React.Fragment key={idx}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={val > 0 ? theme.colors.primary + '22' : theme.colors.empty}
              />
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={val > 0 ? theme.colors.primary : theme.colors.empty}
                stroke={val > 0 ? theme.colors.primaryLight : 'transparent'}
                strokeWidth={1}
              />
              {val > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 6}
                  fill={theme.colors.text}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {val}
                </SvgText>
              )}
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + 16}
                fill={theme.colors.textSecondary}
                fontSize="11"
                fontWeight="800"
                textAnchor="middle"
              >
                {idx + 1}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
