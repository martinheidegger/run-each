type callback <T> = (err?: Error, data?: T) => void
type template <T> = (callback: callback<T>) => void
type straightCb = (err?: Error) => void
type straightTempl = (callback: straightCb) => void
type templateIter <T> = Iterable<template<T>>

export interface RunEach {
  (tasks: Iterable<straightTempl>, next: straightCb): void
  (tasks: Iterable<straightTempl>, concurrency: number, next: straightCb): void
  (tasks: Iterable<straightTempl>, next: straightCb, concurrency: number): void
  <Type> (tasks: templateIter<Type>): Promise<Iterable<Type>>
  <Type> (tasks: templateIter<Type>, next: null | undefined): Promise<Iterable<Type>>
  <Type> (tasks: templateIter<Type>, next: callback<Iterable<Type>>): void
  <Type> (tasks: templateIter<Type>, concurrency: number): Promise<Iterable<Type>>
  <Type> (tasks: templateIter<Type>, concurrency: number, next: callback<Iterable<Type>>): void
  <Type> (tasks: templateIter<Type>, concurrency: number, next: null | undefined): Promise<Iterable<Type>>
  <Type> (tasks: templateIter<Type>, next: callback<Iterable<Type>>, concurrency: number): void
  <Type> (tasks: templateIter<Type>, next: null | undefined, concurrency: number): Promise<Iterable<Type>>
}

export declare const runEach: RunEach
