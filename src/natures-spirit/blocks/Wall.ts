import { Block, world } from "@minecraft/server";

export class WallManager {
  static update_Wall_States(Wall: Block) {
    let above: Block | undefined = Wall.above(1);
    let east: Block | undefined = Wall.east(1);
    let south: Block | undefined = Wall.south(1);
    let north: Block | undefined = Wall.north(1);
    let west: Block | undefined = Wall.west(1);

    const blocks = [
      { block: above, side: "up" },
      { block: north, side: "north" },
      { block: south, side: "south" },
      { block: east, side: "east" },
      { block: west, side: "west" },
    ];

    for (const blockData of blocks) {
      if (blockData.block) {
        if (!(blockData.block.isLiquid || blockData.block.isAir)) {
          if (blockData.side != "up") {
            Wall.setPermutation(
              Wall.permutation.withState(
                ("natures_spirit:connect_" + blockData.side) as any,
                true
              )
            );
          } else {
            Wall.setPermutation(
              Wall.permutation.withState("natures_spirit:top_bit" as any, true)
            );
          }
        } else {
          if (blockData.side != "up") {
            Wall.setPermutation(
              Wall.permutation.withState(
                ("natures_spirit:connect_" + blockData.side) as any,
                false
              )
            );
          } else {
            Wall.setPermutation(
              Wall.permutation.withState("natures_spirit:top_bit" as any, false)
            );
          }
        }
      } else {
        if (blockData.side != "up") {
          Wall.setPermutation(
            Wall.permutation.withState(
              ("natures_spirit:connect_" + blockData.side) as any,
              false
            )
          );
        } else {
          Wall.setPermutation(
            Wall.permutation.withState("natures_spirit:top_bit" as any, false)
          );
        }
      }
    }
    const north_state = Wall.permutation.getState(
      "natures_spirit:connect_north" as any
    );
    const south_state = Wall.permutation.getState(
      "natures_spirit:connect_south" as any
    );
    const east_state = Wall.permutation.getState(
      "natures_spirit:connect_east" as any
    );
    const west_state = Wall.permutation.getState(
      "natures_spirit:connect_west" as any
    );
    if (
      (north_state && south_state && !east_state && !west_state) ||
      (!north_state && !south_state && east_state && west_state)
    ) {
      Wall.setPermutation(
        Wall.permutation.withState("natures_spirit:slim" as any, true)
      );
      if (north_state && south_state) {
        Wall.setPermutation(
          Wall.permutation.withState(
            "natures_spirit:slim_bit" as any,
            "north_south"
          )
        );
      } else {
        Wall.setPermutation(
          Wall.permutation.withState(
            "natures_spirit:slim_bit" as any,
            "east_west"
          )
        );
      }
    } else
      Wall.setPermutation(
        Wall.permutation.withState("natures_spirit:slim" as any, false)
      );
  }

  static updateWallsAround(Block: Block) {
    const directions = ["above", "below", "north", "south", "east", "west"];
    const blocks = [Block, ...directions.map((dir) => Block[dir](1))];

    blocks.forEach((block: Block | undefined) => {
      if (block?.typeId.startsWith("natures_spirit:") && block.typeId.endsWith("_wall")) {
        this.update_Wall_States(block);
      }
    });
  }
}

world.afterEvents.playerBreakBlock.subscribe((data) => {
  WallManager.updateWallsAround(data.block);
});

world.afterEvents.playerPlaceBlock.subscribe((data) => {
  WallManager.updateWallsAround(data.block);
});
