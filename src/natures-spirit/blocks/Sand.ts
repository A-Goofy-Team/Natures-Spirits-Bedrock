import {
  world,
  BlockPermutation,
  ItemStack,
  system,
  BlockVolume,
} from "@minecraft/server";

function dropFallingBlock(blockId, dimension, location) {
  const centerLocation = {
    x: location.x + 0.5,
    y: location.y + 0.5,
    z: location.z + 0.5,
  };
  if (world.gameRules.doEntityDrops)
    dimension.spawnItem(new ItemStack(blockId), centerLocation);
  dimension.spawnParticle(`${blockId}.break_particle`, centerLocation);
}

export const FallingBlocks = {
  "natures_spirit:pink_sand": {
    onRemove: (dimension, location) => {
      dropFallingBlock("natures_spirit:pink_sand", dimension, location);
    },
  },
};

class FallingBlockUtils {
  static FallingBlockTypes = Object.keys(FallingBlocks);
  static FallingBlockPermutations = Object.fromEntries(
    Object.keys(FallingBlocks).map((id) => [id, BlockPermutation.resolve(id)])
  );
  static AirBlock = BlockPermutation.resolve("minecraft:air");
  static ReplaceableBlocks = new Set([
    "minecraft:air",
    "minecraft:structure_void",
    "minecraft:water",
    "minecraft:flowing_water",
    "minecraft:bubble_column",
    "minecraft:lava",
    "minecraft:flowing_lava",
    "minecraft:fire",
    "minecraft:soul_fire",
    "minecraft:vine",
    "minecraft:glow_lichen",
    "minecraft:deadbush",
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:fern",
    "minecraft:large_fern",
    "minecraft:seagrass",
    "minecraft:warped_roots",
    "minecraft:crimson_roots",
    "minecraft:nether_sprouts",
    "minecraft:light_block_0",
    "minecraft:light_block_1",
    "minecraft:light_block_2",
    "minecraft:light_block_3",
    "minecraft:light_block_4",
    "minecraft:light_block_5",
    "minecraft:light_block_6",
    "minecraft:light_block_7",
    "minecraft:light_block_8",
    "minecraft:light_block_9",
    "minecraft:light_block_10",
    "minecraft:light_block_11",
    "minecraft:light_block_12",
    "minecraft:light_block_13",
    "minecraft:light_block_14",
    "minecraft:light_block_15",
  ]);

  static PassableBlocks = new Set([
    ...FallingBlockUtils.ReplaceableBlocks,
    "minecraft:moss_carpet",
    "minecraft:pale_moss_carpet",
    "minecraft:pale_hanging_moss",
    "minecraft:acacia_sapling",
    "minecraft:bamboo_sapling",
    "minecraft:birch_sapling",
    "minecraft:cherry_sapling",
    "minecraft:dark_oak_sapling",
    "minecraft:jungle_sapling",
    "minecraft:mangrove_propagule",
    "minecraft:pale_oak_sapling",
    "minecraft:oak_sapling",
    "minecraft:spruce_sapling",
    "minecraft:kelp",
    "minecraft:sea_pickle",
    "minecraft:reeds",
    "minecraft:nether_wart",
    "minecraft:twisting_vines",
    "minecraft:warped_fungus",
    "minecraft:crimson_fungus",
    "minecraft:brown_mushroom",
    "minecraft:red_mushroom",
    "minecraft:small_dripleaf_block",
    "minecraft:snow_layer",
    "minecraft:cocoa",
    "minecraft:wheat",
    "minecraft:potatoes",
    "minecraft:carrots",
    "minecraft:beetroot",
    "minecraft:pumpkin_stem",
    "minecraft:melon_stem",
    "minecraft:pitcher_crop",
    "minecraft:torchflower_crop",
    "minecraft:sweet_berry_bush",
    "minecraft:brain_coral",
    "minecraft:brain_coral_fan",
    "minecraft:brain_coral_wall_fan",
    "minecraft:bubble_coral",
    "minecraft:bubble_coral_fan",
    "minecraft:bubble_coral_wall_fan",
    "minecraft:fire_coral",
    "minecraft:fire_coral_fan",
    "minecraft:fire_coral_wall_fan",
    "minecraft:horn_coral",
    "minecraft:horn_coral_fan",
    "minecraft:horn_coral_wall_fan",
    "minecraft:tube_coral",
    "minecraft:tube_coral_fan",
    "minecraft:tube_coral_wall_fan",
    "minecraft:dead_brain_coral",
    "minecraft:dead_brain_coral_fan",
    "minecraft:dead_brain_coral_wall_fan",
    "minecraft:dead_bubble_coral",
    "minecraft:dead_bubble_coral_fan",
    "minecraft:dead_bubble_coral_wall_fan",
    "minecraft:dead_fire_coral",
    "minecraft:dead_fire_coral_fan",
    "minecraft:dead_fire_coral_wall_fan",
    "minecraft:dead_horn_coral",
    "minecraft:dead_horn_coral_fan",
    "minecraft:dead_horn_coral_wall_fan",
    "minecraft:dead_tube_coral",
    "minecraft:dead_tube_coral_fan",
    "minecraft:dead_tube_coral_wall_fan",
    "minecraft:dandelion",
    "minecraft:poppy",
    "minecraft:blue_orchid",
    "minecraft:allium",
    "minecraft:azure_bluet",
    "minecraft:red_tulip",
    "minecraft:orange_tulip",
    "minecraft:white_tulip",
    "minecraft:pink_tulip",
    "minecraft:oxeye_daisy",
    "minecraft:cornflower",
    "minecraft:lily_of_the_valley",
    "minecraft:sunflower",
    "minecraft:lilac",
    "minecraft:rose_bush",
    "minecraft:peony",
    "minecraft:pitcher_plant",
    "minecraft:pink_petals",
    "minecraft:wither_rose",
    "minecraft:torchflower",
    "minecraft:open_eyeblossom",
    "minecraft:closed_eyeblossom",
  ]);

  static TriggeringEntities = new Set([
    "minecraft:tnt",
    "minecraft:falling_block",
  ]);

  static shouldFall(block, fb) {
    if (block.y <= block.dimension.heightRange.min) return false;
    const blockBelow = block.below();
    return (
      blockBelow && FallingBlockUtils.PassableBlocks.has(blockBelow.typeId)
    );
  }

  static isWater(block) {
    return (
      block &&
      (block.typeId === "minecraft:water" ||
        block.typeId === "minecraft:flowing_water")
    );
  }
}

class FallingBlockManager {
  pullAboveBlock(block) {
    if (block.y < block.dimension.heightRange.max)
      system.runTimeout(() => this.startFalling(block.above()), 5);
  }

  startFalling(block) {
    const fb = FallingBlocks[block?.typeId];
    if (!fb || !FallingBlockUtils.shouldFall(block, fb)) return;
    const { typeId, permutation } = block;
    fb.onStartFalling?.(block.dimension, block.location);
    block.setPermutation(FallingBlockUtils.AirBlock);
    const fallingEntity = block.dimension.spawnEntity(`${typeId}.entity`, {
      x: block.x + 0.5,
      y: block.y,
      z: block.z + 0.5,
    });
    if (fb.config?.fallingSpeed)
      fallingEntity.applyImpulse({
        x: 0,
        y: Math.min(1, -Math.abs(fb.config.fallingSpeed)),
        z: 0,
      });
    this.pullAboveBlock(block);
  }

  onGround(block, entity) {
    const id = entity.typeId.replace(".entity", ""),
      fb = FallingBlocks[id];
    if (!fb) return;
    let permutationToPlace: any = null;
    const isReplaceable = FallingBlockUtils.ReplaceableBlocks.has(block.typeId),
      stackLayers = fb.config?.type === "layers" && block.typeId === id,
      action =
        !stackLayers && (fb.config?.destroyOnFall || !isReplaceable)
          ? "destroy"
          : fb.config?.type;
    switch (action) {
      case "destroy":
        break;
      default:
        permutationToPlace = FallingBlockUtils.FallingBlockPermutations[id];
    }
    entity.remove();
    if (permutationToPlace) {
      block.setPermutation(permutationToPlace);
      fb.onGround?.(block);
    } else fb.onRemove?.(block.dimension, block.location);
  }
}
const FBM = new FallingBlockManager();

world.afterEvents.playerBreakBlock.subscribe(({ block }) =>
  FBM.startFalling(
    block.dimension.getBlockFromRay(
      block.location,
      { x: 0, y: 1, z: 0 },
      { maxDistance: 2 }
    )?.block
  )
);
world.afterEvents.playerPlaceBlock.subscribe(
  ({ block }) => {
    FBM.startFalling(block);
  },
  { blockTypes: Object.keys(FallingBlocks) }
);
world.afterEvents.explosion.subscribe((data) => {
  const impactedBlocks = data.getImpactedBlocks();
  for (let i = 0; i < impactedBlocks.length; i++) {
    const aboveBlock = impactedBlocks[i]?.above();
    if (aboveBlock)
      if (FallingBlocks[aboveBlock?.typeId]) FBM.startFalling(aboveBlock);
  }
});
world.afterEvents.pistonActivate.subscribe(
  async ({ piston: { block }, isExpanding }) => {
    if (block.typeId === "minecraft:piston" && !isExpanding) {
      const offset = { x: 0, y: 1, z: 0 };
      const facingDirection = block.permutation.getState("facing_direction");
      if (block.y === block.dimension.heightRange.max) return;
      switch (facingDirection) {
        case 0:
          offset.y = 0;
          break;
        case 1:
          if (block.y + 1 < block.dimension.heightRange.max) offset.y = 2;
          break;
        case 2:
          offset.z = 1;
          break;
        case 3:
          offset.z = -1;
          break;
        case 4:
          offset.x = 1;
          break;
        case 5:
          offset.x = -1;
          break;
      }
      if (offset.y) FBM.startFalling(block.offset(offset));
      return;
    }
    const fallingBlockLocations = block.dimension
      .getBlocks(
        new BlockVolume(
          { x: block.x - 13, y: block.y - 13, z: block.z - 13 },
          { x: block.x + 13, y: block.y + 13, z: block.z + 13 }
        ),
        { includeTypes: ["minecraft:moving_block"] }
      )
      ?.getBlockLocationIterator();
    await system.waitTicks(2);
    if (fallingBlockLocations)
      for (const location of fallingBlockLocations)
        FBM.startFalling(block.dimension.getBlock(location));
  }
);
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
  if (!FallingBlockUtils.TriggeringEntities.has(entity.typeId)) return;
  if (entity.location.y < entity.dimension.heightRange.max)
    FBM.startFalling(
      entity.dimension.getBlock({
        x: entity.location.x,
        y: entity.location.y + 1,
        z: entity.location.z,
      })
    );
});

system.afterEvents.scriptEventReceive.subscribe(({ id, sourceEntity }) => {
  if (id === "natures_spirit:is_on_ground") {
    if (
      !sourceEntity ||
      sourceEntity.location.y < sourceEntity.dimension.heightRange.min ||
      sourceEntity.location.y > sourceEntity.dimension.heightRange.max
    )
      sourceEntity?.remove();
    else
      FBM.onGround(
        sourceEntity.dimension.getBlock(sourceEntity.location),
        sourceEntity
      );
  }
});
