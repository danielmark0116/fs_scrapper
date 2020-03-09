import React, { useState, useEffect } from "react";
import { Analysis, ScheduledEvent, Goal } from "./types/types";
import axios from "axios";
import { Button, Table, Layout, Typography, Tree } from "antd";
const { Column } = Table;
const { Content } = Layout;
const { Title, Text } = Typography;

// const data: Analysis = JSON.parse(require("./analytics/analytics.txt"));

// console.log(data);

function App() {
  const [analytics, setAnalytics] = useState<Analysis | null>(null);

  const fetch = async () => {
    try {
      const response = await axios("http://localhost:8000/api/analytics");
      const analytics: Analysis = response.data.data[0];
      setAnalytics(analytics);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    console.log(analytics);
  }, [analytics]);

  const columns = (): any[] => {
    return [
      {
        title: "LP",
        dataIndex: "",
        key: "name"
      }
    ];
  };
  const dataSource = (): any[] => {
    return analytics?.scheduledEvents.map(el => ({ ...el, key: el._id })) ?? [];
  };

  const sumGoal = (data: Goal[]) => {
    let inFirst = 0;
    let inSecond = 0;

    for (let i in data) {
      const index = parseInt(i);
      const golatData = data[index];

      const time = parseInt(golatData.minute.split(`'`)[0].split(`+`)[0]);

      if (time < 50) {
        inFirst += 1;
      } else {
        inSecond += 1;
      }
    }

    return { first: inFirst, second: inSecond };
  };

  return (
    <Layout>
      <Content style={{ padding: 20 }}>
        <Title>FlashScore Scrapper</Title>

        <Table pagination={{ pageSize: 20 }} dataSource={dataSource()}>
          <Column
            title="Mecz"
            render={(_, data: ScheduledEvent) => {
              const treeData = [
                {
                  title: `History events (${data.historyEvents.length})`,
                  key: "0-0",
                  children: data.historyEvents.map(el => ({
                    title: (
                      <a
                        href={el.matchDetailsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {el.title}
                        {el.goalsAtRoundsEnd.length === 0 && (
                          <span style={{ color: "red" }}>
                            {" "}
                            | Brak bramek w 35-45 | 80-90
                          </span>
                        )}
                        {el.goalsAtRoundsEnd.length > 0 && (
                          <>
                            <br />
                            <Text
                              strong
                              style={{ marginRight: 10, color: "#3365df" }}
                            >
                              Pierwsza połowa{" "}
                              {sumGoal(el.goalsAtRoundsEnd).first}
                            </Text>
                            <Text strong>
                              Druga połowa {sumGoal(el.goalsAtRoundsEnd).second}
                            </Text>
                          </>
                        )}
                      </a>
                    ),
                    key: el.matchDetailsLink,
                    disabled: false,
                    children: el.goalsAtRoundsEnd.map(el => ({
                      title: el.minute,
                      key: `${el._id + el.minute}`
                    }))
                  }))
                }
              ];

              return (
                <div>
                  <Title level={4}>{data.title}</Title>
                  <Tree
                    onClick={(_: any, { key }: any) => {
                      window.open(key, "_blank");
                    }}
                    treeData={treeData}
                  />
                </div>
              );
            }}
          />
          <Column
            title="Data"
            render={(_, data: ScheduledEvent) => (
              <Text strong>{data.date}</Text>
            )}
          />

          <Column
            title="Link do spotkania"
            render={(_, data: ScheduledEvent) => (
              <a
                href={data.matchDetailsLink}
                target="_blank"
                rel="noopener no referrer"
              >
                Link
              </a>
            )}
          />
        </Table>
      </Content>
    </Layout>
  );
}

export default App;
