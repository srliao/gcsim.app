import { Button, Tab, Tabs } from "@blueprintjs/core";
import React from "react";
import { Config } from "./Config";
import { SimResults } from "./DataType";
import { Debugger, StatusUptime } from "./DebugView";
import { Details } from "./Details";
import { Options, OptionsProp } from "./Options";
import { DebugRow, parseLog } from "./parse";
import Summary from "./Summary";
import Share from "./Share";
import { calcStatusUptime, parseLogV2 } from "./parsev2";

const opts = [
  "procs",
  "damage",
  "pre_damage_mods",
  "hurt",
  "heal",
  "calc",
  "reaction",
  "element",
  "snapshot",
  "snapshot_mods",
  "status",
  "action",
  "queue",
  "energy",
  "character",
  "enemy",
  "hook",
  "sim",
  "task",
  "artifact",
  "weapon",
  "shield",
  "construct",
  "icd",
];

const defOpts = [
  "damage",
  "element",
  "action",
  "energy",
  "pre_damage_mods",
  "status",
];

type ViewProps = {
  classes?: string;
  selected: string[];
  handleSetSelected: (next: string[]) => void;
  data: SimResults;
  parsed: DebugRow[];
  buffs: StatusUptime;
  handleClose: () => void;
};

function ViewOnly(props: ViewProps) {
  const [tabID, setTabID] = React.useState<string>("result");
  const [optOpen, setOptOpen] = React.useState<boolean>(false);

  const handleTabChange = (next: string) => {
    setTabID(next);
  };

  const optProps: OptionsProp = {
    isOpen: optOpen,
    handleClose: () => {
      setOptOpen(false);
    },
    handleToggle: (t: string) => {
      const i = props.selected.indexOf(t);
      let next = [...props.selected];
      if (i === -1) {
        next.push(t);
      } else {
        next.splice(i, 1);
      }
      props.handleSetSelected(next);
    },
    handleClear: () => {
      props.handleSetSelected([]);
    },
    handleResetDefault: () => {
      props.handleSetSelected(defOpts);
    },
    selected: props.selected,
    options: opts,
  };

  return (
    <div
      className={props.classes + " p-4 rounded-lg bg-gray-800 flex flex-col"}
    >
      <div className="flex flex-row  bg-gray-800 w-full">
        <Tabs
          selectedTabId={tabID}
          onChange={handleTabChange}
          className="w-full"
        >
          <Tab id="result" title="Summary" className="focus:outline-none" />
          <Tab id="details" title="Details" className="focus:outline-none" />
          <Tab id="config" title="Config" className="focus:outline-none" />
          <Tab id="debug" title="Debug" className="focus:outline-none" />
          <Tab id="share" title="Share" className="focus:outline-none" />
          <Tabs.Expander />
          <Button icon="cross" intent="danger" onClick={props.handleClose} />
        </Tabs>
      </div>
      <div className="mt-2 grow mb-4">
        {
          {
            result: (
              // <div className="bg-gray-600 rounded-md m-2 p-2">
              //   <div className=" m-2 w-full xs:w-[300px] sm:w-[640px] hd:w-full wide:w-[1160px] ml-auto mr-auto ">
              <Summary data={props.data} />
              //   </div>
              // </div>
            ),
            config: <Config data={props.data} />,
            debug: (
              <Debugger
                data={props.parsed}
                team={props.data.char_names}
                handleOpenOpts={() => setOptOpen(true)}
                buffs={props.buffs}
              />
            ),
            details: <Details data={props.data} />,
            share: <Share data={props.data} />,
          }[tabID]
        }
      </div>

      <Options {...optProps} />
    </div>
  );
}

type ViewerProps = {
  data: SimResults;
  className?: string;
  handleClose: () => void;
};

export function Viewer(props: ViewerProps) {
  const [selected, setSelected] = React.useState<string[]>(defOpts);

  //string
  console.log(props.data);

  let parsed: DebugRow[];
  let buffs: StatusUptime;
  if (props.data.v2) {
    console.log("parsing as v2: " + props.data.debug);
    const x = parseLogV2(
      props.data.active_char,
      props.data.char_names,
      props.data.debug,
      selected
    );
    parsed = x.rows;
    buffs = x.buffs;
  } else {
    console.log("parsing as v1: " + props.data.debug);
    parsed = parseLog(
      props.data.active_char,
      props.data.char_names,
      props.data.debug,
      selected
    );
    buffs = {};
  }

  console.log(parsed);

  const handleSetSelected = (next: string[]) => {
    setSelected(next);
  };

  let viewProps = {
    classes: props.className,
    selected: selected,
    handleSetSelected: handleSetSelected,
    data: props.data,
    parsed: parsed,
    handleClose: props.handleClose,
    buffs: buffs,
  };

  return <ViewOnly {...viewProps} />;
}
