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
  const [loading, setLoading] = useState<boolean>(false);

  const fetch = async () => {
    setLoading(true);
    // http://192.168.0.59:3000/
    try {
      // const response = await axios("http://192.168.0.59:8000/api/analytics");
      const response = await axios("http://192.168.8.100:8000/api/analytics");
      // const response = await axios("http://192.168.1.114:8000/api/analytics");
      // const response = await axios(
      //   "http://1afc708b5eaf.ngrok.io/api/analytics"
      // );
      const analytics: Analysis = response.data.data[0];
      setLoading(false);
      setAnalytics(analytics);
    } catch (e) {
      setLoading(false);
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
        key: "name",
      },
    ];
  };
  const dataSource = (): any[] => {
    // return (
    //   analytics?.scheduledEvents.map((el) => ({ ...el, key: el._id })) ?? []
    // );
    return (
      analytics?.scheduledEvents
        .map((el) => ({ ...el, key: el._id }))
        .filter((el) => el.historyEvents.length) ?? []
    );
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
        {loading && "loading"}
        <Title>FlashScore Scrapper | {analytics?.createdAt}</Title>

        <Table pagination={{ pageSize: 20 }} dataSource={dataSource()}>
          <Column
            title="Mecz"
            render={(_, data: ScheduledEvent) => {
              const treeData = [
                {
                  title: `History events (${data.historyEvents.length})`,
                  key: "0-0",
                  children: data.historyEvents.map((el) => ({
                    title: (
                      <a
                        href={el.matchDetailsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {el.title}
                        {el.goalsAtRoundsEnd.length === 0 && (
                          <>
                            <br />
                            <span style={{ color: "red" }}>
                              Brak bramek w 35-45 | 80-90
                            </span>
                          </>
                        )}
                        {el.goalsAtRoundsEnd.length > 0 && (
                          <>
                            <br />
                            <Text>
                              1P{" - "}
                              <strong
                                style={{ marginRight: 10, color: "#3365df" }}
                              >
                                {sumGoal(el.goalsAtRoundsEnd).first}
                              </strong>
                            </Text>
                            <Text>
                              2P{" - "}
                              <strong
                                style={{ marginRight: 10, color: "#3365df" }}
                              >
                                {sumGoal(el.goalsAtRoundsEnd).second}
                              </strong>
                            </Text>
                          </>
                        )}
                      </a>
                    ),
                    key: el.matchDetailsLink,
                    disabled: false,
                    children: el.goalsAtRoundsEnd.map((el) => ({
                      title: el.minute,
                      key: `${el._id + el.minute}`,
                    })),
                  })),
                },
              ];

              return (
                <div>
                  <Title level={4}>{data.title + " | " + data.date}</Title>
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
          {/* <Column
            title="Data"
            render={(_, data: ScheduledEvent) => (
              <Text strong>{data.date}</Text>
            )}
          /> */}

          {/* <Column
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
          /> */}
        </Table>
      </Content>
    </Layout>
  );
}

export default App;
