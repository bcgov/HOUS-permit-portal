import { Box, Flex, Grid, HStack, Text, Wrap, WrapItem } from "@chakra-ui/react"
import { ArrowDown } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IReportChart } from "../../../../types/report"

interface IFunnelRow {
  step: string
  count: number
  share: string
  dropLabel: string
}

interface IProps {
  chart: IReportChart
}

// ponytail: non-zero bars have a 9rem floor so the label fits. A very small
// step looks wider than its share; the connector still uses the true share.
const BAR_FLOOR = "9rem"

export function ReportFunnel({ chart }: IProps) {
  const { t } = useTranslation()
  const rows = chart.data.map(funnelRow)
  const total = rows[0]?.count ?? 0

  return (
    <Box>
      {rows.map((row, index) => {
        const next = rows[index + 1]
        return (
          <Box key={row.step}>
            <Grid templateColumns={{ base: "1fr", md: "minmax(0, 1fr) 240px" }} gap={4} alignItems="center">
              <StepBar count={row.count} total={total} label={row.step} />
              <Box>
                <Text fontSize="xl" fontWeight="bold" lineHeight="short">
                  {row.share}
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  {t("reporting.shell.funnel.ofProjectsCreated")}
                </Text>
              </Box>
            </Grid>
            {next ? (
              <Grid templateColumns={{ base: "1fr", md: "minmax(0, 1fr) 240px" }} gap={4} alignItems="center">
                <Connector from={widthPercent(row.count, total)} to={widthPercent(next.count, total)} />
                {next.dropLabel ? (
                  <HStack spacing={1} color="text.secondary" fontSize="sm" align="flex-start">
                    <Box as="span" flexShrink={0} mt="2px" aria-hidden>
                      <ArrowDown size={14} />
                    </Box>
                    <Text>{next.dropLabel}</Text>
                  </HStack>
                ) : (
                  <Box />
                )}
              </Grid>
            ) : null}
          </Box>
        )
      })}
      <Wrap spacingX={6} spacingY={2} pt={4} mt={4} borderTopWidth="1px" borderColor="border.light" fontSize="sm">
        <WrapItem>
          <HStack spacing={2}>
            <Box w="12px" h="12px" bg="theme.blue" flexShrink={0} aria-hidden />
            <Text>{t("reporting.shell.funnel.projectsAtStep")}</Text>
          </HStack>
        </WrapItem>
        <WrapItem>
          <HStack spacing={2}>
            <Box w="12px" h="12px" bg="background.blueLight" flexShrink={0} aria-hidden />
            <Text>{t("reporting.shell.funnel.movedToNext")}</Text>
          </HStack>
        </WrapItem>
        <WrapItem>
          <Text>
            <Text as="span" fontWeight="bold">
              %
            </Text>{" "}
            {t("reporting.shell.funnel.shareOfCreated")}
          </Text>
        </WrapItem>
      </Wrap>
    </Box>
  )
}

function StepBar({ count, total, label }: { count: number; total: number; label: string }) {
  const pct = widthPercent(count, total)
  const empty = count <= 0

  return (
    <Flex justify="center" w="full">
      <Box
        w={empty ? "fit-content" : `${pct}%`}
        minW={empty ? undefined : BAR_FLOOR}
        maxW="100%"
        bg={empty ? "transparent" : "theme.blue"}
        color={empty ? "text.secondary" : "white"}
        borderWidth={empty ? "1px" : 0}
        borderColor="border.light"
        textAlign="center"
        py={3}
        px={4}
        borderRadius="sm"
      >
        <Text fontSize="sm">{label}</Text>
        <Text fontSize="2xl" fontWeight="bold" lineHeight="short">
          {count}
        </Text>
      </Box>
    </Flex>
  )
}

function Connector({ from, to }: { from: number; to: number }) {
  const topLeft = (100 - from) / 2
  const topRight = topLeft + from
  const bottomLeft = (100 - to) / 2
  const bottomRight = bottomLeft + to

  return (
    <Box
      h="36px"
      bg="background.blueLight"
      style={{
        clipPath: `polygon(${topLeft}% 0%, ${topRight}% 0%, ${bottomRight}% 100%, ${bottomLeft}% 100%)`,
      }}
    />
  )
}

function widthPercent(count: number, total: number) {
  if (total <= 0 || count <= 0) return 0
  return (count / total) * 100
}

function funnelRow(row: Record<string, string | number>): IFunnelRow {
  return {
    step: String(row.step ?? ""),
    count: Number(row.count ?? 0),
    share: String(row.share ?? ""),
    dropLabel: String(row.dropLabel ?? ""),
  }
}
