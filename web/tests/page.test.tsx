import { act } from 'react-dom/test-utils';
import {describe, test, beforeEach, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react'
import { enableFetchMocks } from 'jest-fetch-mock'
import type { MockResponseInit } from 'jest-fetch-mock';
import userEvent from '@testing-library/user-event'

import App from "../app/page"
import mock_plotdata from './mocks/mock_plotdata.json'

const PLOTDATA_URL = "https://raw.githubusercontent.com/cragnolini-lab/uniprot-umap/main/plotdata"

enableFetchMocks()

describe('App', () => {

    beforeEach(() => {
        fetchMock.doMock()
        fetchMock.mockIf(`${PLOTDATA_URL}/latest.json`, (req) =>
        new Promise<MockResponseInit>((resolve) => {
            resolve({
                    status: 200,
                    body: JSON.stringify(mock_plotdata)
                })
            })
        );
    })

    test('App loads data and parses it correctly', async () => {

        await act(() => {
            render(<App />)
        })

        const categories = Object.keys(mock_plotdata.keyword_mapping)

        await Promise.all(
            categories.map(async (text) => {


                const el = await screen.findByText(text)
                expect(el).toBeVisible()
            })
        )
    });

    test('Selecting category displays legend', async () => {
        const user = userEvent.setup()

        await act(() => {
            render(<App />)
        })

        const categoryName = Object.keys(mock_plotdata.keyword_mapping)[0]
        const categoryEl = screen.getByText(categoryName)
        const categoryObj = mock_plotdata.keyword_mapping[categoryName]

        user.click(categoryEl)

        // Open category
        await Promise.all(
            Object.entries(categoryObj)
            .map(async ([keyword, values]) => {
                const name = `${keyword} (${values.length})`
                const el = await screen.findByText(name)

                expect(el).toBeVisible()
                user.click(el)
        }))

        const legendEl = await screen.findByText("LEGEND")

        await Promise.all(
            Object.keys(categoryObj)
            .map(async (keyword) => {
                await screen.findByText(keyword)
        }))

    });
});