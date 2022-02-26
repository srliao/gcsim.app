import { DebugItemView } from "./DebugItemView";
import { DebugItem, DebugRow } from "./parse";
import { useVirtual } from "react-virtual";
import AutoSizer from "react-virtualized-auto-sizer";
import React from "react";
import { ButtonGroup, Button, Dialog, Checkbox } from "@blueprintjs/core";

type buffSetting = {
  start: number;
  end: number;
  show: boolean;
};
export type StatusUptime = {
  [key: string]: {
    start: number;
    end: number;
  }[];
};

type rowProps = {
  row: DebugRow;
  highlight: buffSetting;
  showBuffDuration: (e: DebugItem) => void;
  buffs: StatusUptime;
  selectedBuffs: string[];
};

const colors = [
  "bg-blue-800",
  "bg-orange-800",
  "bg-gray-800",
  "bg-cyan-800",
  "bg-green-800",
];

const Row = (props: rowProps) => {
  const cols = props.row.slots.map((slot, ci) => {
    const events = slot.map((e, ei) => {
      return (
        <DebugItemView
          item={e}
          key={ei}
          showBuffDuration={props.showBuffDuration}
        />
      );
    });

    return (
      <div
        key={ci}
        className={
          props.row.active == ci
            ? "border-l-2 border-gray-500 bg-gray-400	"
            : "border-l-2 border-gray-500"
        }
      >
        {events}
      </div>
    );
  });

  const wx = 10 * props.selectedBuffs.length;

  console.log(props.buffs);

  const bc = props.selectedBuffs.map((e, i) => {
    //check if active at current frame
    //props.row.f
    let active = false;
    props.buffs[e].forEach((b) => {
      if (active) return;
      // console.log("checking " + e + " f " + props.row.f + " at ", b);
      if (b.start <= props.row.f && props.row.f <= b.end) active = true;
    });

    let j = i;
    if (j > colors.length) {
      j = 0;
    }
    return (
      <div key={e} className={active ? colors[j] : ""} style={{ width: 10 }} />
    );
  });

  const hl =
    props.highlight.show &&
    props.row.f >= props.highlight.start &&
    props.row.f <= props.highlight.end;

  //map out each col
  return (
    <div className="flex flex-row" key={props.row.key}>
      <div
        className={
          hl
            ? "text-right text-gray-100 border-b-2 border-gray-500 bg-blue-500 flex flex-row"
            : "text-right text-gray-100 border-b-2 border-gray-500  flex flex-row"
        }
        style={{ minWidth: "100px" }}
      >
        <div className="flex-grow">
          {`${props.row.f} | ${(props.row.f / 60).toFixed(2)}s`}
        </div>
      </div>
      <div
        className={`flex flex-row border-l-2 border-gray-500`}
        style={{ width: wx }}
      >
        {bc}
      </div>
      <div className="grid grid-cols-5 flex-grow border-b-2 border-gray-500">
        {cols}
      </div>
      <div style={{ width: "20px", minWidth: "20px" }} />
    </div>
  );
};

type Props = {
  data: DebugRow[];
  team: string[];
  buffs: StatusUptime;
  handleOpenOpts: () => void;
};

export function Debugger({ data, team, handleOpenOpts, buffs }: Props) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [b, setb] = React.useState<string[]>([]);
  const parentRef = React.useRef<HTMLDivElement>(null!);
  const [hl, sethl] = React.useState<buffSetting>({
    start: 0,
    end: 0,
    show: false,
  });

  const handleShowBuffDuration = (e: DebugItem) => {
    // const show = hl.show;
    let next = {
      show: true,
      start: e.frame,
      end: e.ended,
    };
    sethl(next);
  };

  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef,
    keyExtractor: React.useCallback(
      (index: number) => {
        return data[index].f;
      },
      [data]
    ),
  });

  const char = team.map((c) => {
    return (
      <div
        key={c}
        className="capitalize text-lg font-medium text-gray-100 border-l-2 border-b-2 border-gray-500"
      >
        {c}
      </div>
    );
  });

  const handleToggle = (key: string) => {
    return () => {
      let next = b.slice();
      const i = b.indexOf(key);
      if (i === -1) {
        next.push(key);
        setb(next);
        return;
      }
      //otherwise delete
      next.splice(i, 1);
      setb(next);
    };
  };

  let rows = [];

  for (const key in buffs) {
    if (Object.prototype.hasOwnProperty.call(buffs, key)) {
      const element = buffs[key];
      rows.push(
        <div key={key}>
          <Checkbox
            checked={b.includes(key)}
            onClick={handleToggle(key)}
            label={key}
          />
        </div>
      );
    }
  }

  const wx = 10 * b.length;

  console.log(wx);

  return (
    <div className="h-full">
      <div className="h-full m-2 p-2 rounded-md bg-gray-600 text-xs flex flex-col min-w-[60rem] min-h-[20rem]">
        <AutoSizer defaultHeight={100}>
          {({ height, width }) => (
            <div
              ref={parentRef}
              style={{
                minHeight: "100px",
                height: height,
                width: width,
                overflow: "auto",
                position: "relative",
              }}
              id="resize-inner"
            >
              <div className="flex flex-row debug-header">
                <div
                  className={
                    "font-medium text-lg text-gray-100 border-b-2 border-gray-500 text-right "
                  }
                  style={{ minWidth: "100px" }}
                >
                  F | Sec
                </div>
                <div
                  className={`border-b-2 border-l-2 border-gray-500`}
                  style={{ width: wx }}
                >
                  {""}
                </div>
                <div className="grid grid-cols-5 flex-grow">
                  <div className="font-medium text-lg text-gray-100 border-l-2 border-b-2 border-gray-500">
                    Sim
                  </div>
                  {char}
                </div>
                <div style={{ width: "20px", minWidth: "20px" }} />
              </div>
              <div
                className="ListInner"
                style={{
                  // Set the scrolling inner div of the parent to be the
                  // height of all items combined. This makes the scroll bar work.
                  height: `${rowVirtualizer.totalSize}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {
                  // The meat and potatoes, an array of the virtual items
                  // we currently want to render and their index in the original data.
                }
                {rowVirtualizer.virtualItems.map((virtualRow) => (
                  <div
                    key={virtualRow.index}
                    // ref={virtualRow.measureRef}
                    ref={(el) => virtualRow.measureRef(el)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      // Positions the virtual elements at the right place in container.
                      // minHeight: `${virtualRow.size - 10}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    // id={"virtual-row-"+virtualRow.key}
                  >
                    <Row
                      row={data[virtualRow.index]}
                      highlight={hl}
                      showBuffDuration={handleShowBuffDuration}
                      buffs={buffs}
                      selectedBuffs={b}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </AutoSizer>
      </div>
      <div className="w-full pl-2 pr-2">
        <ButtonGroup fill>
          <Button onClick={() => setOpen(true)} icon="cog" intent="warning">
            Buff Tracker
          </Button>
          <Button onClick={handleOpenOpts} icon="cog" intent="success">
            Debug Settings
          </Button>
        </ButtonGroup>
      </div>
      <Dialog isOpen={open} onClose={() => setOpen(false)}>
        <div>{rows}</div>
      </Dialog>
    </div>
  );
}
