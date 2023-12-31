import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import { sub } from "date-fns"
import axios from  "axios"

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts"

const initialState = {
    posts: [],
    status: "idle", //"idle" | "loading" | "succeeded" | "failed"
    error: null

    // {
    //     id: 1, 
    //     title: "Learning Redux Toolkit", 
    //     content: "I've heard good things",
    //     date: sub(new Date(), {minutes: 10}).toISOString(),
    //     reactions: {
    //         thumbsUp: 0,
    //         wow: 0,
    //         heart: 0,
    //         rocket: 0,
    //         coffee: 0
    //     }
    // },
    // {   
    //     id: 2, 
    //     title: "Slices",
    //     content: "The more i say slice the more i want pizzas",
    //     date: sub(new Date(), {minutes: 5}).toISOString(),
    //     reactions: {
    //         thumbsUp: 0,
    //         wow: 0,
    //         heart: 0,
    //         rocket: 0,
    //         coffee: 0
    //     }
    // },
}

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
    const response = await axios.get(POSTS_URL);
    return response.data
})

export const addNewPost = createAsyncThunk("posts/addNewPost", async (initialPost) => {
    const response = await axios.post(POSTS_URL, initialPost);
    return response.data
})

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        postAdded: {
            reducer(state, action) {
                state.posts.push(action.payload)
            },
            prepare(title, content, userId) {
                return {
                    payload: {
                        id: nanoid(),
                        title,
                        content,
                        date: new Date().toISOString(),
                        userId,
                        reactions: {
                            thumbsUp: 0,
                            wow: 0,
                            heart: 0,
                            rocket: 0,
                            coffee: 0
                        }
                    }
                }
            }   
        }, 
        reactionAdded (state, action) {
            const {postId, reaction} = action.payload
            const existingPost = state.posts.find(post => post.id === postId)
            if (existingPost) {
                existingPost.reactions[reaction]++
            }
        }
    },
    extraReducers(builder) {
        builder.addCase(fetchPosts.pending, (state, action) => {
            state.status = "succeeded"
        })
        .addCase(fetchPosts.fulfilled, (state, action) => {
            console.log(action.payload)
            state.status = "succeeded"
            let min = 1;
            const loadedPosts = action.payload.map(post => {
                post.date = sub(new Date(), {minutes: min++}).toISOString()
                post.reactions = {
                    thumbsUp: 0,
                    wow: 0,
                    heart: 0,
                    rocket: 0,
                    coffee: 0
                }
                return post
            });
            state.posts = loadedPosts
        })
        .addCase(fetchPosts.rejected, (state, action) => {
            state.status = "failed"
            state.error = action.error.message
        })
        .addCase(addNewPost.fulfilled, (state, action) => {
            action.payload.userId = Number(action.payload.userId)
            action.payload.date = new Date().toISOString()
            action.payload.reactions = {
                thumbsUp: 0,
                wow: 0,
                heart: 0,
                rocket: 0,
                coffee: 0
            }
            console.log(action.payload)
            state.posts.push(action.payload)
        })  
    }
})

export const selectAllPosts = (state) => state.posts.posts;
export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;

export const { postAdded, reactionAdded } = postSlice.actions

export default postSlice.reducer