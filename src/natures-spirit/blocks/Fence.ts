import { Block, BlockPermutation, world } from "@minecraft/server";

const tags = [
  "fence",
  "metal",
  "wood",
  "stone",
  "wood_pick_diggable",
  "stone_pick_diggable",
  "iron_pick_diggable",
  "diamond_pick_diggable",
  "netherite_pick_diggable",
  "dirt",
  "sand",
  "gravel",
  "grass",
  "snow",
  "fence_gate",
];

const excludedTags = ["text_sign", "trapdoors", "plant"];

const directions = [
  { dir: "east", opp: "west" },
  { dir: "west", opp: "east" },
  { dir: "north", opp: "south" },
  { dir: "south", opp: "north" },
];

// world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
//   blockComponentRegistry.registerCustomComponent("natures_spirit:fence", {
//     beforeOnPlayerPlace(e: any) {
//       const directions = [
//         { dir: "east", opp: "west" },
//         { dir: "west", opp: "east" },
//         { dir: "north", opp: "south" },
//         { dir: "south", opp: "north" },
//       ];

//       tags.forEach((tag) => {
//         const block = e.block;

//         directions.forEach(({ dir, opp }) => {
//           const adjacentBlock = block?.[dir]?.();
//           if (
//             adjacentBlock?.hasTag(tag) &&
//             !excludedTags.some((excluded) => block.hasTag(excluded))
//           ) {
//             e.permutationToPlace = e.permutationToPlace.withState(
//               `natures_spirit:${dir}` as any,
//               true
//             );
//             if (adjacentBlock.hasTag("natures_spirit:fence")) {
//               adjacentBlock.setPermutation(
//                 adjacentBlock.permutation.withState(
//                   `natures_spirit:${opp}`,
//                   true
//                 )
//               );
//             }
//           }
//         });
//       });
//     },

//     onPlayerDestroy({ block }) {
//       const updatePermutation = (
//         direction: string,
//         oppositeDirection: string
//       ) => {
//         const neighborBlock = block?.[direction]();
//         if (neighborBlock?.hasTag("natures_spirit:fence")) {
//           neighborBlock.setPermutation(
//             neighborBlock.permutation.withState(
//               `natures_spirit:${oppositeDirection}`,
//               false
//             ) as BlockPermutation
//           );
//         }
//       };

//       const directions: [keyof Block, string][] = [
//         ["east", "west"],
//         ["west", "east"],
//         ["north", "south"],
//         ["south", "north"],
//       ];

//       directions.forEach(([dir, oppDir]) => updatePermutation(dir, oppDir));
//     },
//   });
// });

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  directions.forEach(({ dir, opp }) => {
    const adjacentBlock = block?.[dir]();
    if (tags.some((tag) => adjacentBlock?.hasTag(tag))) {
      if (
        block.typeId.startsWith("natures_spirit:") &&
        block.typeId.endsWith("_fence")
      ) {
        block.setPermutation(
          block.permutation.withState(`natures_spirit:${dir}` as any, true)
        );
      }
      if (
        adjacentBlock.typeId.startsWith("natures_spirit:") &&
        adjacentBlock.typeId.endsWith("_fence")
      ) {
        updateAdjacentBlockState(block, opp, dir);
      }
    }
  });
});

world.afterEvents.playerBreakBlock.subscribe(
  ({ brokenBlockPermutation, block }) => {
    if (
      brokenBlockPermutation.type.id.startsWith("natures_spirit:") &&
      brokenBlockPermutation.type.id.endsWith("_fence")
    ) {
      const updatePermutation = (
        direction: string,
        oppositeDirection: string
      ) => {
        const neighborBlock = block?.[direction]();
        if (
          neighborBlock.typeId.startsWith("natures_spirit:") &&
          neighborBlock.typeId.endsWith("_fence")
        ) {
          neighborBlock.setPermutation(
            neighborBlock.permutation.withState(
              `natures_spirit:${oppositeDirection}`,
              false
            ) as BlockPermutation
          );
        }
      };

      const directions: [keyof Block, string][] = [
        ["east", "west"],
        ["west", "east"],
        ["north", "south"],
        ["south", "north"],
      ];

      directions.forEach(([dir, oppDir]) => updatePermutation(dir, oppDir));
    } else {
      for (const tag of tags) {
        if (
          brokenBlockPermutation.hasTag(tag) &&
          !block.typeId.includes("sign")
        ) {
          const directions = [
            { state: "west", opposite: "east" },
            { state: "east", opposite: "west" },
            { state: "south", opposite: "north" },
            { state: "north", opposite: "south" },
          ];
          for (const { state, opposite } of directions) {
            updateAdjacentBlockState(block, state, opposite, false);
          }
        }
      }
    }
  }
);
function updateAdjacentBlockState(block, state, direction, value = true) {
  const adjacentBlock: Block = block[direction]();
  if (
    adjacentBlock.typeId.startsWith("natures_spirit:") &&
    adjacentBlock.typeId.endsWith("_fence")
  ) {
    adjacentBlock.setPermutation(
      adjacentBlock.permutation.withState(
        (`natures_spirit:` + state) as any,
        value
      )
    );
  }
}
