import { Router } from "express";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { matchIdParamSchema } from "../validation/matches.js";
import { desc, eq } from "drizzle-orm";

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get("/", async (req, res) => {
  try {
    // 1. Validate req.params using matchIdParamSchema
    const paramValidation = matchIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: "Invalid match ID",
        details: paramValidation.error.errors,
      });
    }

    const { id: matchId } = paramValidation.data;

    // 2. Validate req.query using listCommentaryQuerySchema
    const queryValidation = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: queryValidation.error.errors,
      });
    }

    const { limit = 100 } = queryValidation.data;
    const finalLimit = Math.min(limit, MAX_LIMIT);

    // 3. Fetch data from the "commentary" table
    const comments = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt)) // 4. Order by "createdAt" descending
      .limit(finalLimit); // 5. Apply limit

    return res.status(200).json({ commentary: comments });
  } catch (error) {
    console.error("Error fetching commentary:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

commentaryRouter.post("/", async (req, res) => {
  try {
    // 1. Validate req.params using matchIdParamSchema
    const paramValidation = matchIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: "Invalid match ID",
        details: paramValidation.error.errors,
      });
    }

    const { id: matchId } = paramValidation.data;

    // 2. Validate req.body using createCommentarySchema
    const bodyValidation = createCommentarySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid commentary data",
        details: bodyValidation.error.errors,
      });
    }

    // 3. Insert the data into the commentary table
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId,
        ...bodyValidation.data,
      })
      .returning();

    // 4. Return the result
    const broadcastCommentary = req.app.locals.broadcastCommentary;
    if (broadcastCommentary) {
      broadcastCommentary(matchId, newCommentary);
    }

    return res.status(201).json({
      message: "Commentary entry created successfully",
      commentary: newCommentary,
    });
  } catch (error) {
    console.error("Error creating commentary:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});